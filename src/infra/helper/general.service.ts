import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import crypto from "crypto";
import dayjs from 'dayjs';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
@Injectable()
export class GeneralService implements OnModuleInit {
    onModuleInit() {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        dayjs.extend(isSameOrAfter);
        dayjs.extend(isSameOrBefore);
    }

    generateNumber(length: number) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result
    }

    maskPhoneNumber(phone: string) {
        return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
    }

    toNumber(numberString: string): number {
        const valueAsString = String(numberString);
        const sanitized = valueAsString.replace(/[^0-9.-]+/g, '');
        const standardized = sanitized.replace(',', '.');
        const result = parseFloat(standardized);

        return isNaN(result) ? 0 : result;
    }

    generatePassword(salt: string, password: string): string {
        return crypto.createHash('sha1').update(salt + password).digest('hex')
    }

    generateRandomString(size: number): string {
        return crypto.randomBytes(size).toString('hex')
    }

    padWithZeros(value: number | bigint, targetLength: number): string {
        if (!value) value = 0n;
        return value.toString().padStart(targetLength, '0');
    }

    toBigInt(value: any): bigint {
        if (typeof value === 'bigint') {
            return value;
        }
        if (typeof value === 'number') {
            return BigInt(value);
        }
        if (typeof value === 'string') {
            const numericValue = value.replace(/[^0-9.-]+/g, '');
            return BigInt(numericValue);
        }
        if (Array.isArray(value)) {
            return BigInt(value[0]);
        }
        if (typeof value === 'boolean') {
            return value ? BigInt(1) : BigInt(0);
        }
        if (value instanceof Date) {
            return BigInt(value.getTime());
        }

        return BigInt(0);
    }

    formatIdr(value: Decimal | number | string | bigint): string {
        let number: number;

        if (typeof value === 'object' && 'toNumber' in value) {
            number = value.toNumber();
        } else if (typeof value === 'bigint') {
            number = Number(value);
        } else {
            number = Number(value);
        }

        return 'Rp ' + number.toLocaleString('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    monthToRoman(month: number): string {
        const romanNumerals = [
            'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
        ];

        if (month < 1 || month > 12) {
            throw new Error("invalid month");
        }

        return romanNumerals[month - 1];
    }

    maskEmail(email: string) {
        const [localPart, domain] = email.split("@");
        const maskLength = Math.floor(localPart.length / 2);
        const maskedLocalPart = localPart.substring(0, maskLength) + '*'.repeat(localPart.length - maskLength);

        return `${maskedLocalPart}@${domain}`
    }

    capitalizeSentence(sentence: string): string {
        if (!sentence) return sentence;

        return sentence
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    isSameArrayIgnoreOrder(a: any[], b: any[]): boolean {
        if (a.length !== b.length) return false
        const sortedA = [...a].sort()
        const sortedB = [...b].sort()
        return sortedA.every((val, i) => val === sortedB[i])
    }

    parseIndonesianDate(date: string, format: string): Date {
        let parsed = dayjs.utc(date).tz('Asia/Jakarta')
        if (!parsed.isValid() && format) {
            parsed = dayjs.utc(date, format).tz('Asia/Jakarta')
        }

        if (parsed.isValid()) {
            const localTimeString = parsed.format('YYYY-MM-DDTHH:mm:ss');
            return new Date(`${localTimeString}.000Z`);
        }

        return null;
    }

    formatCurrency(
        param: {
            value: Decimal | number | string | bigint
            language?: string;
            locale?: string;
            currency?: string;
            prefix?: string;
            fractionDigits?: number;
        }): string {
        let number: number;

        if (typeof param.value === 'object' && 'toNumber' in param.value) {
            number = param.value.toNumber();
        } else if (typeof param.value === 'bigint') {
            number = Number(param.value);
        } else {
            number = Number(param.value);
        }

        const locale = param?.locale ?? 'id-ID';
        const currency = param?.currency ?? 'IDR';
        const prefix = param?.prefix;
        const fractionDigits = param?.fractionDigits ?? 2;

        // Default formatting using Intl
        let formatted = number.toLocaleString(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });

        formatted = `${currency} ${number.toLocaleString(locale, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        })}`;

        if (prefix) {
            formatted = `${prefix} ${number.toLocaleString(locale, {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            })}`;
        }

        return formatted;
    }

    formatWhatsAppNumber(phone: string): string {
        if (!phone && phone !== '0') {
            throw new BadRequestException('Phone number is required');
        }

        let s = String(phone).trim();
        s = s.replace(/[\s\-\(\)]/g, '');
        s = s.replace(/^\+/, '');
        s = s.replace(/\D/g, '');

        if (/^0+/.test(s)) {
            s = s.replace(/^0+/, '62');
        }

        if (s.length < 6) {
            throw new BadRequestException('Phone number seems too short after normalization');
        }

        return s;
    }
}