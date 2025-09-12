import { ExtensionContext, workspace } from 'vscode';
import { connect, Socket } from 'net';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	StreamInfo,
	Trace,
	CloseAction,
	ErrorAction,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

function connectWithRetry(
	port = workspace.getConfiguration('jabref').get<number>('client.port', 2087),
	host = workspace.getConfiguration('jabref').get<string>('client.host', 'localhost'),
	backoffStartMs = 1000,
	backoffMaxMs = 30000
): Promise<StreamInfo> {
	return new Promise<StreamInfo>((resolve) => {
		let attempt = 0;

		const tryConnect = () => {
			const socket: Socket = connect({ port, host });

			const cleanup = () => {
				socket.removeAllListeners('connect');
				socket.removeAllListeners('error');
				socket.removeAllListeners('close');
			};

			const restart = () => {
				cleanup();
				socket.destroy();
				attempt++;
				const delay = Math.min(backoffMaxMs, backoffStartMs * 2 ** (attempt - 1));
				setTimeout(tryConnect, delay);
			}

			socket.once('connect', () => {
				attempt = 0;
				cleanup();
				resolve({ reader: socket, writer: socket });
			});

			socket.once('error', () => {
				restart();
			});

			socket.once('close', (hadError) => {
				if (hadError) return;
				restart();
			});
		};

		tryConnect();
	});
}

export function activate(context: ExtensionContext) {
	context
	const serverOptions: ServerOptions = () => connectWithRetry();

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'bibtex' }],
		synchronize: { configurationSection: 'jabref' },
		errorHandler: {
			error: () => ({ action: ErrorAction.Continue }),
			closed: () => ({ action: CloseAction.Restart }),
		},
		initializationFailedHandler: () => true,
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