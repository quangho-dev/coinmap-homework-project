import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SignUpResponse')
export class SignUpResponse {
  @Field()
  message: string;
}
