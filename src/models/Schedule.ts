import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
  subject: string;
  date: string;
  time: string;
  venue: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
