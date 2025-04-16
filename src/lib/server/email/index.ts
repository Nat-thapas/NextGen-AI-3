import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';

import { env } from '$env/dynamic/private';

import { resetTemplate } from './templates/reset';
import { verifyTemplate } from './templates/verify';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: +env.SMTP_PORT,
	secure: env.SMTP_SECURE.toLowerCase() === 'true',
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASSWORD
	}
});

const compiledVerifyTemplate: Handlebars.TemplateDelegate = Handlebars.compile(verifyTemplate);
const compilerResetTemplate: Handlebars.TemplateDelegate = Handlebars.compile(resetTemplate);

export async function sendVerifyEmail(to: string, url: string): Promise<void> {
	await transporter.sendMail({
		from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_ADDRESS}>`,
		to,
		subject: 'Verify your email address',
		html: compiledVerifyTemplate({ verifyUrl: url })
	});
}

export async function sendResetEmail(to: string, url: string): Promise<void> {
	await transporter.sendMail({
		from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_ADDRESS}>`,
		to,
		subject: 'Reset your password',
		html: compilerResetTemplate({ resetUrl: url })
	});
}
