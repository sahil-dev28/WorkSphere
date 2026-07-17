import { type InferSchemaType, model, Schema } from "mongoose";

import { departments, employeeStatuses } from "@/schema/employee";

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
  },
  {
    timestamps: true,
  },
);

employeeSchema.index({ name: 1, _id: 1 });

export type EmployeeAttrs = InferSchemaType<typeof employeeSchema>;

export const Employee = model("Employee", employeeSchema);
