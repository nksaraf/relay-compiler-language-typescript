import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

import * as Printer from "relay-compiler/lib/core/IRPrinter";
// import * as Transformer from "relay-compiler/lib/core/IRTransformer";

export const formatterFactory = (
  compilerOptions: ts.CompilerOptions = {}
): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  node,
  sourceHash
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "relay-runtime";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node: ${documentType ||
    "never"} = ${concreteText};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  let query;
  if (node.kind === "Request") {
    const matched: any = typeText.match(
      /\/[\*]{2}QUERY[\*]{2}\n(?<query>[^\*]*?)[\*]{4}\//
    );
    query = matched[1];
  }

  return `/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
${hash ? `/* ${hash} */\n` : ""}
${documentTypeImport}
${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
${query ? `(node as any).query = ${JSON.stringify(query)}` : ""}
export default node;
`;
};
