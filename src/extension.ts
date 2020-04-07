import * as vscode from 'vscode';
import { parse, extname, join, basename } from 'path';
import { readdirSync, Dirent } from 'fs';

import Gallery from './Gallery';
import { EXT_SVG, EXCLUDE } from './constant';

import galleryTpl from './templates/gallery.ejs';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "SVG Gallery" is now active!');

  const webviewPanels: Map<string, vscode.WebviewPanel> = new Map();

  context.subscriptions.push(vscode.commands.registerCommand('SVGGallery.open', (folder: any, folders: any[]) => {

    const selectedFolders: any[] = folders.length ? folders : [folder];

    selectedFolders.forEach((v: any) => {
      const path: string = v.fsPath;
      let webViewPanel: vscode.WebviewPanel | undefined = webviewPanels.get(path);

      if (!webViewPanel) {
        webViewPanel = vscode.window.createWebviewPanel(
          path,
          `${parse(v.path).name} - SVG Gallery`,
          vscode.ViewColumn.One,
          { enableScripts: true, enableFindWidget: true }
        );
        webViewPanel.onDidDispose(() => webviewPanels.delete(path));
        context.subscriptions.push(webViewPanel.webview.onDidReceiveMessage(({ command, args }: { command: string, args: any }) => {
          switch (command) {
            case 'OPEN_FILE':
              const { path }: { path: string } = args;
              if (path) { vscode.window.showTextDocument(vscode.Uri.file(path)); }
              return;
          }
        }));
        webviewPanels.set(path, webViewPanel);
      } else {
        webViewPanel.reveal();
      }

      const gallery: Gallery = buildGallery(path, webViewPanel.webview);
      webViewPanel.webview.html = gallery.generateHtml();
    });
  }));
}

function buildGallery(path: string, webview: vscode.Webview): Gallery {
  return new Gallery(webview, galleryTpl, findFilesByExt(path, EXT_SVG));
}

function findFilesByExt(path: string, ext: string): Map<string, string[]> {
  let result: Map<string, string[]> = new Map();

  if (EXCLUDE.has(basename(path))) { return result; };

  const ds: Dirent[] = readdirSync(path, { withFileTypes: true });
  const files = filterByExt(ds, ext).map(e => join(path, e.name));
  if (files.length) { result.set(path, files); }
  ds.filter(d => d.isDirectory()).forEach(d => {
    result = new Map([...result, ...findFilesByExt(join(path, d.name), ext)]);
  });
  return result;
}

function filterByExt(ds: Dirent[], ext: string): Dirent[] {
  return ds.filter(d => d.isFile() && extname(d.name).toLocaleLowerCase() === ext);
}

// this method is called when your extension is deactivated
export function deactivate() { }
