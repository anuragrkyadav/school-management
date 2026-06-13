import mongoose, { Schema, Document, Types } from 'mongoose';
import { IAuditFields, auditSchemaDefinition } from './common.js';

export interface IHostelVisitor extends Document, IAuditFields {
  schoolId: Types.ObjectId;
  visitorName: string;
  visitorType?: string;
  studentName?: string;
  relationship?: string;
  room?: string;
  purpose: string;
  contact?: string;
  workOrder?: string;
  vehicleNo?: string;
  idProof?: string;
  checkIn: Date;
  checkOut?: Date;
  status: 'checked-in' | 'checked-out' | 'pending';
}

const hostelVisitorSchema = new Schema<IHostelVisitor>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    visitorName: { type: String, required: true },
    visitorType: { type: String },
    studentName: { type: String },
    relationship: { type: String },
    room: { type: String },
    purpose: { type: String, required: true },
    contact: { type: String },
    workOrder: { type: String },
    vehicleNo: { type: String },
    idProof: { type: String },
    checkIn: { type: Date, default: Date.now, required: true },
    checkOut: { type: Date },
    status: { 
      type: String, 
      enum: ['checked-in', 'checked-out', 'pending'], 
      default: 'checked-in', 
      required: true 
    },
    ...auditSchemaDefinition
  },
  { timestamps: true }
);

export const HostelVisitor = mongoose.model<IHostelVisitor>('HostelVisitor', hostelVisitorSchema);
