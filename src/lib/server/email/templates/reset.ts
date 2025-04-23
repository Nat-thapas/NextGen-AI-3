export const resetTemplate: string = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
	<head>
		<meta charset="utf-8" />
		<meta name="x-apple-disable-message-reformatting" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
		<meta name="color-scheme" content="light dark" />
		<meta name="supported-color-schemes" content="light dark" />
		<!--[if mso]>
			<noscript>
				<xml>
					<o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
						<o:PixelsPerInch>96</o:PixelsPerInch>
					</o:OfficeDocumentSettings>
				</xml>
			</noscript>
			<style>
				td,
				th,
				div,
				p,
				a,
				h1,
				h2,
				h3,
				h4,
				h5,
				h6 {
					font-family: 'Segoe UI', sans-serif;
					mso-line-height-rule: exactly;
				}
				.mso-break-all {
					word-break: break-all;
				}
			</style>
		<![endif]-->
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
			rel="stylesheet"
			media="screen" />
		<style>
			@media (max-width: 600px) {
				.sm-p-6 {
					padding: 24px !important;
				}
			}
		</style>
	</head>
	<body
		style="
			margin: 0;
			width: 100%;
			padding: 0;
			-webkit-font-smoothing: antialiased;
			word-break: break-word;
		">
		<div
			role="article"
			aria-roledescription="email"
			aria-label
			lang="en"
			style="background: linear-gradient(to bottom, white, #f6e6ff)">
			<div
				style="
					padding-left: 16px;
					padding-right: 16px;
					font-family:
						Inter,
						ui-sans-serif,
						system-ui,
						-apple-system,
						'Segoe UI',
						sans-serif;
				">
				<table align="center" style="margin: 0 auto" cellpadding="0" cellspacing="0" role="none">
					<tr>
						<td style="width: 100%; max-width: 600px">
							<div role="separator" style="line-height: 24px">&zwj;</div>
							<table style="width: 100%" cellpadding="0" cellspacing="0" role="none">
								<tr>
									<td
										class="sm-p-6"
										style="
											border-radius: 8px;
											background-color: #fffffe;
											padding: 24px 36px;
											border: 1px solid #e2e8f0;
										">
										<table align="center" cellpadding="0" cellspacing="0" role="none">
											<tbody>
												<tr>
													<td>
														<a href="https://bigblahaj.com/replace/with/real/link">
															<img
																src="https://cdn.jsdelivr.net/gh/phuwit/CE-NextGenAi-Email@main/images/logo-w360.png"
																width="360"
																height="92"
																alt
																style="max-width: 100%; vertical-align: middle" />
														</a>
													</td>
												</tr>
											</tbody>
										</table>
										<div role="separator" style="line-height: 24px">&zwj;</div>
										<h1
											style="
												margin: 0 0 24px;
												font-size: 24px;
												line-height: 32px;
												font-weight: 600;
												color: #0f172a;
											">
											Hello there!
										</h1>
										<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #475569">
											Someone have request a password for reset for your account. Please click the
											button below to continue. If you did not request a password reset, you can
											ignore this email.
										</p>
										<div style="margin-bottom: 48px">
											<p style="font-size: 18px; font-weight: 600; color: #1e293b">Warning</p>
											<ul style="font-size: 14px; line-height: 24px; color: #475569">
												<li>Do not share this link with anyone.</li>
												<li>Please complete your password reset within 15 minutes.</li>
											</ul>
										</div>
										<table align="center" cellpadding="0" cellspacing="0" role="none">
											<tbody>
												<tr>
													<td>
														<div>
															<a
																href="{{resetUrl}}"
																style="
																	background: linear-gradient(to bottom, #ffd0f0, #9a46fb);
																	display: inline-block;
																	text-decoration: none;
																	font-size: 16px;
																	line-height: 1;
																	background-color: #4338ca;
																	color: #fffffe;
																	margin-left: auto;
																	margin-right: auto;
																	margin-bottom: 48px;
																	border-radius: 9999px;
																	padding: 16px 32px;
																	text-align: center;
																	font-weight: 700;
																">
																<!--[if mso]>
																	<i style="mso-font-width: 150%; mso-text-raise: 31px" hidden>
																		&emsp;
																	</i>
																<![endif]-->
																<span style="mso-text-raise: 16px">Reset password</span>
																<!--[if mso]>
																	<i hidden style="mso-font-width: 150%">&emsp;&#8203;</i>
																<![endif]-->
															</a>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
										<p style="margin: 0; font-size: 16px; line-height: 24px; color: #475569">
											Thanks,
											<br />
											<span style="font-weight: 600">CE Next Gen AI Team</span>
										</p>
										<div
											role="separator"
											style="
												height: 1px;
												line-height: 1px;
												background-color: #cbd5e1;
												margin-top: 24px;
												margin-bottom: 24px;
											">
											&zwj;
										</div>
										<p
											class="mso-break-all"
											style="margin: 0; font-size: 12px; line-height: 20px; color: #475569">
											If you're having trouble clicking the "Reset password" button, use this URL
											instead.
											<a href="{{resetUrl}}" style="color: #1e293b; text-decoration: underline">
												{{resetUrl}}
											</a>
										</p>
									</td>
								</tr>
							</table>
							<div role="separator" style="line-height: 24px">&zwj;</div>
						</td>
					</tr>
				</table>
			</div>
		</div>
	</body>
</html>`;
