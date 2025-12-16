import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcrypt";

// Define interface for User document
interface IUser extends Document {
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "EXECUTOR" | "BENEFICIARY" | "CLIENT";
  password?: string;
  avatar?: string;
  address?: string;
  executorId?: string;
  beneficiaryIds: string[];
  savedBeneficiaries: string[];
  savedDonationRecipients: string[];
  savedActions: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "AGENT", "EXECUTOR", "BENEFICIARY", "CLIENT"],
    },
    password: { type: String, required: false },
    avatar: { type: String },

    address: { type: String },
    executorId: { type: String },
    beneficiaryIds: [{ type: String }],
    savedBeneficiaries: [{ type: String }],
    savedDonationRecipients: [{ type: String }],
    savedActions: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
