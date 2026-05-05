import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { Transform } from "class-transformer";

export function IsBigInt(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsBigInt',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (value === null || value === undefined) return true; // Allow null/undefined for optional fields
                    try {
                        BigInt(value); // Try converting to BigInt
                        return true;
                    } catch {
                        return false;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid BigInt value`;
                },
            },
        });
    };
}

export function TransformToBigInt() {
    return Transform(({ value }) => {
        if (value === null || value === undefined || value === '') return undefined;

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map((v) => {
                try {
                    return v !== null && v !== undefined && v !== '' ? BigInt(v) : undefined;
                } catch {
                    return v; // Return original value if conversion fails
                }
            });
        }

        // Handle single values
        try {
            return BigInt(value);
        } catch {
            return value; // Return original value if conversion fails
        }
    });
}

export function IsBigIntArray(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsBigIntArray',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (!Array.isArray(value)) return false;
                    return value.every((v) => {
                        try {
                            BigInt(v);
                            return true;
                        } catch {
                            return false;
                        }
                    });
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be an array of valid BigInt values`;
                },
            },
        });
    };
}