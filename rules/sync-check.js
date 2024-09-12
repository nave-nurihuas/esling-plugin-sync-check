const fs = require("fs");
const path = require("path");

module.exports = {
  meta: {
    type: "problem", // 문제를 나타내는 타입
    docs: {
      description:
        "Check if specified files are synchronized with the common module",
      category: "Possible Errors",
    },
    schema: [
      {
        type: "object",
        properties: {
          commonModule: { type: "string" },
          filesToCheck: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      syncError:
        "The file {{ filePath }} is not synchronized with the common module.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const commonModulePath = path.resolve(
      context.getCwd(),
      options.commonModule
    );
    const filesToCheck = options.filesToCheck || [];

    let commonModuleContent;

    try {
      commonModuleContent = fs.readFileSync(commonModulePath, "utf8");
    } catch (error) {
      context.report({
        message: `Unable to read common module file: ${commonModulePath}`,
      });
      return {};
    }

    return {
      Program(node) {
        const filePath = context.getFilename();
        if (!filesToCheck.includes(filePath)) {
          return;
        }

        let fileContent;
        try {
          fileContent = fs.readFileSync(filePath, "utf8");
        } catch (error) {
          context.report({
            message: `Unable to read file: ${filePath}`,
          });
          return;
        }

        if (fileContent !== commonModuleContent) {
          context.report({
            node,
            messageId: "syncError",
            data: { filePath },
          });
        }
      },
    };
  },
};
