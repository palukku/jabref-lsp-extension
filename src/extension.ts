import { ExtensionContext } from 'vscode';
import { connect } from 'net';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	StreamInfo,
	Trace
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: ExtensionContext) {
	const serverOptions: ServerOptions = () =>
		new Promise<StreamInfo>((resolve) => {
			const socket = connect({ port: 2087 }, () => {
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

	context.subscriptions.push({
		dispose: () => { void client?.stop(); }
	});
}

export async function deactivate(): Promise<void> {
  await client?.stop();
}