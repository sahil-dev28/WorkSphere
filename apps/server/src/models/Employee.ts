import bcrypt from "bcrypt";
import { type InferSchemaType, model, Schema } from "mongoose";

import {
  BCRYPT_SALT_ROUNDS,
  departments,
  employeeRoles,
  employeeStatuses,
} from "@/utils/constants";

const employeeSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

employeeSchema.index({ name: 1, _id: 1 });

employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

export type EmployeeAttrs = InferSchemaType<typeof employeeSchema>;

export const Employee = model("Employee", employeeSchema);
