import bcrypt from "bcrypt";
import { type InferSchemaType, model, Schema } from "mongoose";

import {
  BCRYPT_SALT_ROUNDS,
  departments,
  employeeRoles,
  employeeStatuses,
  formatEmployeeId,
  parseEmployeeIdSequence,
} from "@/utils/constants";

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide phone"],
      trim: true,
    },
    department: {
      type: String,
      enum: departments,
      required: [true, "Please provide department"],
    },
    designation: {
      type: String,
      required: [true, "Please provide designation"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Please provide salary"],
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: employeeStatuses,
      default: "active",
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      select: false,
    },
    role: {
      type: String,
      enum: employeeRoles,
      default: "employee",
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.index({ name: 1, _id: 1 });
employeeSchema.index({ reportingManager: 1 });

employeeSchema.pre("save", async function () {
  if (!this.isNew) {
    return;
  }

  const lastEmployee = await Employee.findOne({}, { employeeId: 1 })
    .sort({ employeeId: -1 })
    .lean();

  const nextSequence = lastEmployee?.employeeId
    ? parseEmployeeIdSequence(lastEmployee.employeeId) + 1
    : 1;

  this.employeeId = formatEmployeeId(nextSequence);
});

employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

export type EmployeeAttrs = InferSchemaType<typeof employeeSchema>;

export const Employee = model("Employee", employeeSchema);
