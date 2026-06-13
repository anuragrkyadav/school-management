import { Router } from 'express';
import { HostelController } from '../../controllers/hostel.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';

export const hostelRouter = Router();

// Ensure all routes require authentication
hostelRouter.use(authenticateToken);

// Base Hostel CRUD
hostelRouter.get('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getHostels);
hostelRouter.post('/', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.createHostel);
hostelRouter.patch('/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.updateHostel);
hostelRouter.delete('/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.deleteHostel);

// Dynamic Structure Configuration
hostelRouter.post('/structure', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.generateStructure);
hostelRouter.get('/structure', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getStructure);

// Room & Bed Allotment
hostelRouter.get('/allocations', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.getAllocations);
hostelRouter.post('/allocations', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.allocateBed);
hostelRouter.post('/allocations/vacate', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.vacateBed);
hostelRouter.post('/allocations/transfer', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.transferAllocation);

// Fees Management
hostelRouter.post('/fees/plans', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.createFeePlan);
hostelRouter.get('/fees/plans', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getFeePlans);
hostelRouter.post('/fees/invoices', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.issueFeeInvoice);
hostelRouter.get('/fees/invoices', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT'), HostelController.getFeeInvoices);
hostelRouter.patch('/fees/invoices/:id/status', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.toggleInvoiceStatus);
hostelRouter.post('/fees/payments', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.recordFeePayment);

// Gatepass / Movement
hostelRouter.post('/movement', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.recordMovement);

// Communication
hostelRouter.post('/messages', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.createMessage);
hostelRouter.get('/messages', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getMessages);

// Analytics
hostelRouter.get('/analytics', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getAnalytics);

// Legacy/Existing Compatibility Routes
hostelRouter.get('/rooms', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getHostelRooms);
hostelRouter.patch('/rooms/:block/:roomNo', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.updateHostelRoom);
hostelRouter.post('/complaints', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.createHostelComplaint);
hostelRouter.get('/complaints', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.getHostelComplaints);
hostelRouter.patch('/complaints/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.updateHostelComplaint);

hostelRouter.post('/visitors', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.createHostelVisitor);
hostelRouter.get('/visitors', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getHostelVisitors);
hostelRouter.patch('/visitors/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.updateHostelVisitor);

hostelRouter.post('/rooms/:block/:roomNo/allocate', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.allocateRoom);
hostelRouter.post('/rooms/:block/:roomNo/deallocate', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.deallocateRoom);

hostelRouter.post('/leaves', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.createHostelLeave);
hostelRouter.get('/leaves', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.getHostelLeaves);
hostelRouter.patch('/leaves/:id/status', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.updateHostelLeaveStatus);

hostelRouter.post('/attendance', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.recordHostelAttendance);
hostelRouter.get('/attendance', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.getHostelAttendance);

hostelRouter.post('/notices', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD'), HostelController.createHostelNotice);
hostelRouter.get('/notices', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HOSTEL_HEAD', 'STUDENT', 'PARENT', 'TEACHER'), HostelController.getHostelNotices);
