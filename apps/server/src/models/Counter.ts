import { model, Schema } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = model("Counter", counterSchema);

export async function getNextSequence(counterName: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  ).lean<{ seq: number }>();

  // upsert + returnDocument:"after" guarantees a document is always returned here.
  return counter!.seq;
}

export async function resetSequence(counterName: string): Promise<void> {
  await Counter.deleteOne({ _id: counterName });
}

export async function setSequence(counterName: string, value: number): Promise<void> {
  await Counter.findOneAndUpdate(
    { _id: counterName },
    { $set: { seq: value } },
    { upsert: true },
  );
}
