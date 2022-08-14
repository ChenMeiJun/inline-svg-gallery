import * as vscode from 'vscode';
import { basename } from 'path';
import { readFileSync } from 'fs';
import { ENCODING } from './constant';

const fastXmlParser = require('fast-xml-parser');

export default class SVGFile {

  public basename: string | undefined;
  public uri: vscode.Uri | undefined | string;
  public width: string = '';
  public height: string = '';

  constructor(private webview: vscode.Webview, public path: string) {
    // const a = vscode.Uri.file(path);
    this.uri = this.webview.asWebviewUri(vscode.Uri.file(path));
    const contents: string = readFileSync(path, { encoding: ENCODING }).trim();

    const dynamicParamRegExp = /[a-zA-Z0-9]+=\{\{[\s\S]+\}\}/;
    const deconstructRegExp = /\{[\s\S]+\}/;
    const svgRegExp = /<svg\s+[\s\S]+<\/svg>/;
    
    const result = svgRegExp.exec(contents);
    const svgContent = result?.[0]?.replace(dynamicParamRegExp, '')?.replace(deconstructRegExp, '');

    const svgInnerRegExp = /<[\s\S]+\>/;
    const result2 = svgInnerRegExp.exec(contents);
    let svgInnerContent = result2?.[0];

    if (svgContent) {
      if (fastXmlParser.validate(svgContent) === true) {
        this.uri = svgContent;
        try {
          const o = fastXmlParser.parse(svgContent, { attributeNamePrefix: '', ignoreAttributes: false });
          const { svg: { width, height } } = o;
          if (width) { this.width = `W:${width}`; }
          if (height) { this.height = `H:${height}`; }
        } catch (error) {
          console.error(error);
        }
      }
      this.basename = basename(path);
    } else if(svgInnerContent) {
      this.uri = `<svg width="34" height="34" viewBox="0 0 34 34" fill="#666" xmlns="http://www.w3.org/2000/svg">${svgInnerContent}</svg>`;
      svgInnerContent = this.uri;
      try {
        const o = fastXmlParser.parse(svgInnerContent, { attributeNamePrefix: '', ignoreAttributes: false });
        const { svg: { width, height } } = o;
        if (width) { this.width = `W:${width}`; }
        if (height) { this.height = `H:${height}`; }
      } catch (error) {
        console.error(error);
      }
      this.basename = basename(path);
    }

    
  }
}
