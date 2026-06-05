import { app } from '@azure/functions';
import {
  getStaticContactFunctionOptions,
  handleAzureFunctionStaticContact,
  STATIC_CONTACT_FUNCTION_NAME,
} from './azure-function-adapter.mjs';

app.http(
  STATIC_CONTACT_FUNCTION_NAME,
  getStaticContactFunctionOptions(handleAzureFunctionStaticContact),
);
