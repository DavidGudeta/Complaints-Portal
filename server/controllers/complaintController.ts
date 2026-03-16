import db from "../db/index.js";
import { createNotification } from "../utils/notifications.js";

export const submitComplaint = (req: any, res: any) => {
  const { 
    EMAIL_ID, TAXPAYER_PHONE, COMPLAINANT_NAME, COMPLAINANT_PHONE, TAXPAYER_NAME, TAXPAYER_ADDRESS, LETTER_NO,
    ENTERPISE_NAME, MANAGER_PHONE, TAX_CENTER, COMPLAINTS_CATEGORY, TIN, COMPLAIN_DETAILS, COMPLAINTS_POINTS,
    MACHINE_CODE, COMPLAINS_ON, ENTERPRISE_ADDRESS, CUSTOMER_ADDRESS, COMPLAINTS_DETAILS, REMARKS,
    COMPLAINTS_SHORTLY, REFERENCE_NO, APPLICATION_TYPE, CASE_TYPE, COMPLAINTS_SUB_CATEGORY, COMPLAINTS_TITLE
  } = req.body;
  
  const COMPLAINTS_CODE = "CMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const IP_ADDRESS = req.ip || req.connection.remoteAddress;
  const CURRENT_YEAR = new Date().getFullYear().toString();

  try {
    const complainantResult = db.prepare(`
      INSERT INTO COMPLAINANT (
        EMAIL_ID, TAXPAYER_PHONE, COMPLAINANT_NAME, COMPLAINANT_PHONE, TAXPAYER_NAME, TAXPAYER_ADDRESS, IP_ADDRESS, LETTER_NO
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      EMAIL_ID, TAXPAYER_PHONE, COMPLAINANT_NAME, COMPLAINANT_PHONE, TAXPAYER_NAME, TAXPAYER_ADDRESS, IP_ADDRESS, LETTER_NO
    );

    const result = db.prepare(`
      INSERT INTO complaints_case (
        COMPLAINTS_CODE, ENTERPISE_NAME, MANAGER_PHONE, COMPLAINANT_NAME, COMPLAINANT_PHONE, COMPLAINANT_EMAIL,
        TAX_CENTER, COMPLAINTS_CATEGORY, TIN, COMPLAIN_DETAILS, COMPLAINTS_POINTS, MACHINE_CODE, COMPLAINS_ON,
        ENTERPRISE_ADDRESS, CUSTOMER_ADDRESS, COMPLAINTS_DETAILS, REMARKS, COMPLAINTS_SHORTLY, REFERENCE_NO,
        APPLICATION_TYPE, CASE_TYPE, CURRENT_YEAR, COMPLAINTS_SUB_CATEGORY, COMPLAINTS_TITLE, COMPLAINT_CODE
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      COMPLAINTS_CODE, ENTERPISE_NAME, MANAGER_PHONE, COMPLAINANT_NAME, COMPLAINANT_PHONE, EMAIL_ID,
      TAX_CENTER, COMPLAINTS_CATEGORY, TIN, COMPLAIN_DETAILS, COMPLAINTS_POINTS, MACHINE_CODE, COMPLAINS_ON,
      ENTERPRISE_ADDRESS, CUSTOMER_ADDRESS, COMPLAINTS_DETAILS, REMARKS, COMPLAINTS_SHORTLY, REFERENCE_NO,
      APPLICATION_TYPE, CASE_TYPE, CURRENT_YEAR, COMPLAINTS_SUB_CATEGORY, COMPLAINTS_TITLE, COMPLAINTS_CODE
    );
    
    const complaintId = result.lastInsertRowid;

    // Handle file attachments
    if (req.files && Array.isArray(req.files)) {
      const insertAttachment = db.prepare(`
        INSERT INTO attachments (complaint_id, filename, url)
        VALUES (?, ?, ?)
      `);
      
      req.files.forEach((file: any) => {
        insertAttachment.run(complaintId, file.originalname, `/uploads/${file.filename}`);
      });
    }
    
    const staff = db.prepare("SELECT id FROM users WHERE role = 'DIRECTOR' OR role = 'TEAM_LEADER'").all() as any[];
    staff.forEach(s => {
      createNotification(
        s.id, 
        'NEW_COMPLAINT', 
        'New Complaint Received', 
        `A new complaint (${COMPLAINTS_CODE}) has been submitted.`,
        `/cases/detail/${COMPLAINTS_CODE}`
      );
    });

    res.json({ tracking_code: COMPLAINTS_CODE, id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
};

export const trackComplaint = (req: any, res: any) => {
  const complaint = db.prepare(`
    SELECT c.*, cat.name as category_name, subcat.name as subcategory_name, tc.name as tax_center_name
    FROM complaints_case c
    LEFT JOIN tax_centers tc ON c.TAX_CENTER = tc.id
    LEFT JOIN categories cat ON c.COMPLAINTS_CATEGORY = cat.id
    LEFT JOIN categories subcat ON c.COMPLAINTS_SUB_CATEGORY = subcat.id
    WHERE c.COMPLAINT_CODE = ?
  `).get(req.params.code) as any;
  
  if (complaint) {
    const responses = db.prepare(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.complaint_id = ?
      ORDER BY r.created_at ASC
    `).all(complaint.COMPLAINTS_ID);
    
    const formattedResponses = responses.map((r: any) => ({
      ...r,
      user_name: r.user_name || "Taxpayer",
      user_role: r.user_role || "PUBLIC"
    }));

    const attachments = db.prepare(`
      SELECT * FROM attachments WHERE complaint_id = ?
    `).all(complaint.COMPLAINTS_ID);
    
    res.json({ ...complaint, responses: formattedResponses, attachments });
  } else {
    res.status(404).json({ error: "Complaint not found" });
  }
};

export const listComplaints = (req: any, res: any) => {
  const { role, userId, status, taxCenterId } = req.query;
  let query = `
    SELECT c.*, cat.name as category_name, subcat.name as subcategory_name, u.name as assigned_name, tc.name as tax_center_name
    FROM complaints_case c
    LEFT JOIN users u ON c.RELEVANT_OFFICER = u.id
    LEFT JOIN tax_centers tc ON c.TAX_CENTER = tc.id
    LEFT JOIN categories cat ON c.COMPLAINTS_CATEGORY = cat.id
    LEFT JOIN categories subcat ON c.COMPLAINTS_SUB_CATEGORY = subcat.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (role === 'OFFICER') {
    query += " AND c.RELEVANT_OFFICER = ?";
    params.push(userId);
  }

  if (status) {
    query += " AND c.CASE_STATUS = ?";
    params.push(status);
  }

  query += " ORDER BY c.APPLIED_DATE DESC";
  
  const complaints = db.prepare(query).all(...params);
  res.json(complaints);
};

export const updateComplaint = (req: any, res: any) => {
  const { 
    CASE_STATUS, RELEVANT_OFFICER, COMPLAINTS_TITLE, COMPLAIN_DETAILS, COMPLAINTS_CATEGORY, COMPLAINTS_SUB_CATEGORY, 
    TIN, COMPLAINANT_NAME, COMPLAINANT_EMAIL, COMPLAINANT_PHONE, MACHINE_CODE, REFERENCE_NO, ENTERPRISE_ADDRESS, CUSTOMER_ADDRESS, REMARKS 
  } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (CASE_STATUS) { updates.push("CASE_STATUS = ?"); params.push(CASE_STATUS); }
  if (RELEVANT_OFFICER !== undefined) { updates.push("RELEVANT_OFFICER = ?"); params.push(RELEVANT_OFFICER); }
  if (COMPLAINTS_TITLE) { updates.push("COMPLAINTS_TITLE = ?"); params.push(COMPLAINTS_TITLE); }
  if (COMPLAIN_DETAILS) { updates.push("COMPLAIN_DETAILS = ?"); params.push(COMPLAIN_DETAILS); }
  if (COMPLAINTS_CATEGORY) { updates.push("COMPLAINTS_CATEGORY = ?"); params.push(COMPLAINTS_CATEGORY); }
  if (COMPLAINTS_SUB_CATEGORY) { updates.push("COMPLAINTS_SUB_CATEGORY = ?"); params.push(COMPLAINTS_SUB_CATEGORY); }
  if (TIN) { updates.push("TIN = ?"); params.push(TIN); }
  if (COMPLAINANT_NAME) { updates.push("COMPLAINANT_NAME = ?"); params.push(COMPLAINANT_NAME); }
  if (COMPLAINANT_EMAIL) { updates.push("COMPLAINANT_EMAIL = ?"); params.push(COMPLAINANT_EMAIL); }
  if (COMPLAINANT_PHONE) { updates.push("COMPLAINANT_PHONE = ?"); params.push(COMPLAINANT_PHONE); }
  if (MACHINE_CODE) { updates.push("MACHINE_CODE = ?"); params.push(MACHINE_CODE); }
  if (REFERENCE_NO) { updates.push("REFERENCE_NO = ?"); params.push(REFERENCE_NO); }
  if (ENTERPRISE_ADDRESS) { updates.push("ENTERPRISE_ADDRESS = ?"); params.push(ENTERPRISE_ADDRESS); }
  if (CUSTOMER_ADDRESS) { updates.push("CUSTOMER_ADDRESS = ?"); params.push(CUSTOMER_ADDRESS); }
  if (REMARKS) { updates.push("REMARKS = ?"); params.push(REMARKS); }

  if (updates.length > 0) {
    updates.push("LAST_UPDATED_DATE = CURRENT_TIMESTAMP");
    const query = `UPDATE complaints_case SET ${updates.join(", ")} WHERE COMPLAINTS_ID = ? OR COMPLAINT_CODE = ?`;
    params.push(req.params.id, req.params.id);
    db.prepare(query).run(...params);

    const complaint = db.prepare("SELECT * FROM complaints_case WHERE COMPLAINTS_ID = ? OR COMPLAINT_CODE = ?").get(req.params.id, req.params.id) as any;
    
    if (RELEVANT_OFFICER) {
      createNotification(
        RELEVANT_OFFICER,
        'ASSIGNMENT',
        'New Case Assigned',
        `You have been assigned to case ${complaint.COMPLAINT_CODE}.`,
        `/cases/detail/${complaint.COMPLAINT_CODE}`
      );
    }

    if (CASE_STATUS && complaint.RELEVANT_OFFICER) {
      createNotification(
        complaint.RELEVANT_OFFICER,
        'STATUS_UPDATE',
        'Case Status Updated',
        `Case ${complaint.COMPLAINT_CODE} status changed to ${CASE_STATUS}.`,
        `/cases/detail/${complaint.COMPLAINT_CODE}`
      );
    }
  }

  res.json({ success: true });
};

export const deleteComplaint = (req: any, res: any) => {
  db.prepare("DELETE FROM complaints_case WHERE COMPLAINTS_ID = ? OR COMPLAINT_CODE = ?").run(req.params.id, req.params.id);
  res.json({ success: true });
};

export const addResponse = (req: any, res: any) => {
  const { complaint_id, user_id, message } = req.body;
  db.prepare("INSERT INTO responses (complaint_id, user_id, message) VALUES (?, ?, ?)").run(complaint_id, user_id, message);
  
  const complaint = db.prepare("SELECT * FROM complaints_case WHERE COMPLAINTS_ID = ?").get(complaint_id) as any;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id) as any;

  if (user && user.role === 'OFFICER') {
    const leaders = db.prepare("SELECT id FROM users WHERE role = 'TEAM_LEADER'").all() as any[];
    leaders.forEach(l => {
      createNotification(
        l.id,
        'NEW_RESPONSE',
        'New Response Added',
        `${user.name} added a response to ${complaint.COMPLAINT_CODE}.`,
        `/cases/detail/${complaint.COMPLAINT_CODE}`
      );
    });
  }

  res.json({ success: true });
};

export const listResponses = (req: any, res: any) => {
  const responses = db.prepare(`
    SELECT r.*, c.COMPLAINT_CODE as tracking_code, c.COMPLAINANT_NAME as complainant_name, u.name as user_name, u.role as user_role
    FROM responses r
    JOIN complaints_case c ON r.complaint_id = c.COMPLAINTS_ID
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(responses);
};

export const addAssessment = (req: any, res: any) => {
  const { complaint_id, user_id, findings, recommendation } = req.body;
  db.prepare("INSERT INTO assessments (complaint_id, user_id, findings, recommendation) VALUES (?, ?, ?, ?)").run(complaint_id, user_id, findings, recommendation);
  
  // Update complaint status
  db.prepare("UPDATE complaints_case SET CASE_STATUS = 'ASSESSED' WHERE COMPLAINTS_ID = ?").run(complaint_id);
  
  res.json({ success: true });
};

export const listAssessments = (req: any, res: any) => {
  const assessments = db.prepare(`
    SELECT a.*, c.COMPLAINT_CODE as tracking_code, c.COMPLAINANT_NAME as complainant_name, u.name as assessor_name
    FROM assessments a
    JOIN complaints_case c ON a.complaint_id = c.COMPLAINTS_ID
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
  `).all();
  res.json(assessments);
};

export const submitFeedback = (req: any, res: any) => {
  const { tracking_code, message } = req.body;
  const complaint = db.prepare("SELECT * FROM complaints_case WHERE COMPLAINT_CODE = ?").get(tracking_code) as any;
  
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  db.prepare("INSERT INTO responses (complaint_id, user_id, message) VALUES (?, ?, ?)").run(complaint.COMPLAINTS_ID, null, message);
  
  // Notify assigned officer or team leader
  const notifyUserId = complaint.RELEVANT_OFFICER;
  if (notifyUserId) {
    createNotification(
      notifyUserId,
      'NEW_RESPONSE',
      'New Feedback Received',
      `Taxpayer sent a message regarding ${tracking_code}.`,
      `/cases/detail/${tracking_code}`
    );
  }

  res.json({ success: true });
};

export const addAttachments = (req: any, res: any) => {
  const { code } = req.params;
  const complaint = db.prepare("SELECT COMPLAINTS_ID FROM complaints_case WHERE COMPLAINT_CODE = ?").get(code) as any;

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  try {
    if (req.files && Array.isArray(req.files)) {
      const insertAttachment = db.prepare(`
        INSERT INTO attachments (complaint_id, filename, url)
        VALUES (?, ?, ?)
      `);
      
      req.files.forEach((file: any) => {
        insertAttachment.run(complaint.COMPLAINTS_ID, file.originalname, `/uploads/${file.filename}`);
      });

      // Notify assigned officer
      const c = db.prepare("SELECT RELEVANT_OFFICER, COMPLAINT_CODE FROM complaints_case WHERE COMPLAINTS_ID = ?").get(complaint.COMPLAINTS_ID) as any;
      if (c.RELEVANT_OFFICER) {
        createNotification(
          c.RELEVANT_OFFICER,
          'STATUS_UPDATE',
          'New Documents Uploaded',
          `New documents have been uploaded for case ${c.COMPLAINT_CODE}.`,
          `/cases/detail/${c.COMPLAINT_CODE}`
        );
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ error: "No files uploaded" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to upload attachments" });
  }
};
