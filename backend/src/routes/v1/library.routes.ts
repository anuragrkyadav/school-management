import { Router } from 'express';
import { LibraryController } from '../../controllers/library.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { requireParentChildAccess } from '../../middleware/resource-isolation.js';
import { requirePermissions } from '../../middleware/rbac.js';
import { upload } from '../../middleware/upload.js';

export const libraryRouter = Router();

// Ensure all routes require authentication
libraryRouter.use(authenticateToken);

libraryRouter.get('/books', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'ADMIN'), LibraryController.getLibraryBooks);
libraryRouter.post('/books', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ADMIN'), requirePermissions('MANAGE_LIBRARY'), LibraryController.addLibraryBook);
libraryRouter.post('/circulations/issue', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ADMIN'), requirePermissions('MANAGE_LIBRARY'), LibraryController.issueBook);
libraryRouter.post('/circulations/:id/return', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ADMIN'), requirePermissions('MANAGE_LIBRARY'), LibraryController.returnBook);
libraryRouter.get('/circulations', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ADMIN'), requirePermissions('MANAGE_LIBRARY'), LibraryController.getAllCirculations);
libraryRouter.get(
  '/circulations/student/:studentId',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'ADMIN'),
  requireParentChildAccess,
  LibraryController.getStudentCirculations,
);

libraryRouter.get(
  '/reservations/student/:studentId',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'ADMIN'),
  requireParentChildAccess,
  LibraryController.getStudentReservations,
);

libraryRouter.get(
  '/fines/student/:studentId',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'ADMIN'),
  requireParentChildAccess,
  LibraryController.getStudentFines,
);

libraryRouter.post(
  '/fines/:id/pay',
  requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT', 'STUDENT', 'ADMIN'),
  LibraryController.payFine,
);

// E-Book routes
libraryRouter.get('/ebooks', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'ADMIN'), LibraryController.getEBooks);
libraryRouter.post('/ebooks', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ADMIN'), requirePermissions('MANAGE_LIBRARY'), upload.single('file'), LibraryController.uploadEBook);

