import * as vscode from 'vscode';
import * as net from 'net';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	StreamInfo,
	Trace
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
	const serverOptions: ServerOptions = () =>
		new Promise<StreamInfo>((resolve) => {
			const socket = net.connect({ port: 2087 }, () => {
				resolve({ reader: socket, writer: socket });
			});
		});

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'bibtex' }],
		synchronize: { configurationSection: 'jabref' }
	};

	client = new LanguageClient(
		'jabref-4-vscode',
		'JabRef LSP Client',
		serverOptions,
		clientOptions
	);

	client.setTrace(Trace.Verbose);
	client.start();

	
}

export async function deactivate(): Promise<void> {
  await client?.stop();
}