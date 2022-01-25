/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import type Editor from '../api/Editor';
import * as IndentOutdent from '../commands/IndentOutdent';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    'Indent,Outdent': (command) => {
      IndentOutdent.handle(editor, command);
    },
  });

  editor.editorCommands.addCommands({
    Outdent: () => IndentOutdent.canOutdent(editor),
  }, 'state');
};
