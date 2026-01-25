import { BaseError, ContractFunctionRevertedError, decodeErrorResult, type Abi } from 'viem';

export type DecodedContractError = {
  name?: string;
  args?: readonly unknown[];
  message: string;
};

export function decodeContractError(
  error: unknown,
  abi: Abi,
  mapError?: (name: string, args?: readonly unknown[]) => string | undefined
): DecodedContractError {
  const baseError = error instanceof BaseError ? error : undefined;
  const cause = baseError?.cause ?? error;

  if (cause instanceof ContractFunctionRevertedError) {
    if (cause.data) {
      try {
        let decodedName: string | undefined;
        let decodedArgs: readonly unknown[] | undefined;

        if (typeof cause.data === 'string') {
          const decoded = decodeErrorResult({ abi, data: cause.data });
          decodedName = decoded.errorName;
          decodedArgs = decoded.args;
        } else if (typeof cause.data === 'object' && 'errorName' in cause.data) {
          const decoded = cause.data as { errorName?: string; args?: readonly unknown[] };
          decodedName = decoded.errorName;
          decodedArgs = decoded.args;
        }

        const name = decodedName;
        const args = decodedArgs;
        const mapped = mapError && name ? mapError(name, args) : undefined;
        if (mapped) {
          return { name, args, message: mapped };
        }

        if (name === 'Error' && Array.isArray(args) && typeof args[0] === 'string') {
          return { name, args, message: args[0] as string };
        }

        if (name === 'Panic' && Array.isArray(args)) {
          return { name, args, message: `Contract panic (${String(args[0])})` };
        }

        if (name) {
          return { name, args, message: name };
        }
      } catch {
        // Fall through to generic handling below.
      }
    }

    if (typeof cause.reason === 'string' && cause.reason.length > 0) {
      return { message: cause.reason };
    }
  }

  if (baseError?.shortMessage) {
    return { message: baseError.shortMessage };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  return { message: 'Transaction failed' };
}
