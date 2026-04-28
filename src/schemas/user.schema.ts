import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export type UserDocument = User &
  Document & {
    generateToken: () => void;
    checkPassword: (password: string) => Promise<boolean>;
  };

const SALT_WORK_FACTOR = 10;

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  token!: string;

  @Prop()
  displayName!: string;

  @Prop({
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  this.token = nanoid();
};

UserSchema.methods.checkPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
      delete (ret as any).password;
      return ret;
    },
  });
