import {
  FilesInterceptor,
  MulterModuleOptions,
} from '@nestjs/platform-express';
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
 * Creates an interceptor with given fieldName, maxCount and options exnteding FilesInterceptor.
 * @param {string} fieldName - Field name.
 * @param {number} maxCount - Maximum number of files to upload.
 * @param localOptions - FilesInterceptor local options.
 * @returns Returns new interceptor.
 */
export const UploadMultiFileInterceptor = (
  fieldName: string,
  maxCount?: number,
  localOptions?: (context: ExecutionContext) => MulterOptions,
) => {
  const FilesInterceptorInstance = FilesInterceptor(fieldName, maxCount);

  class MixinInterceptor extends FilesInterceptorInstance {
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
