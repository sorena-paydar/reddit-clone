import { FileInterceptor, MulterModuleOptions } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants';
import * as multer from 'multer';
import {
  ExecutionContext,
  Optional,
  Inject,
  CallHandler,
  mixin,
  Type,
  NestInterceptor,
} from '@nestjs/common';

/**
 * Creates an interceptor with given fieldName and options exnteding FileInterceptor.
 * @param {string} fieldName - Field name.
 * @param localOptions - FileInterceptor local options.
 * @returns Returns new interceptor.
 */
export const UploadFileInterceptor = (
  fieldName: string,
  localOptions?: (context: ExecutionContext) => MulterOptions,
) => {
  const FileInterceptorInstance = FileInterceptor(fieldName);

  class MixinInterceptor extends FileInterceptorInstance {
    protected multer: any;
    protected moduleOptions: any;

    constructor(
      @Optional()
      @Inject(MULTER_MODULE_OPTIONS)
      options: MulterModuleOptions = {},
    ) {
      super();
      this.moduleOptions = options;
    }

    intercept(context: ExecutionContext, next: CallHandler<any>): any {
      this.multer = (multer as any)({
        ...this.moduleOptions,
        ...localOptions(context),
      });
      return super.intercept(context, next);
    }
  }

  const Interceptor = mixin(MixinInterceptor);
  return Interceptor as Type<NestInterceptor>;
};
