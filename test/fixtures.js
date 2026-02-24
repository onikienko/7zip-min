'use strict';

const { SRC_DIR_NAME } = require('./helpers');

module.exports = function makeFolderStructure(fsify) {
  return [
    {
      type: fsify.DIRECTORY,
      name: SRC_DIR_NAME,
      contents: [
        {
          type: fsify.DIRECTORY,
          name: 'dir1',
          contents: [
            {
              type: fsify.FILE,
              name: 'Some = File = Name.txt',
              contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel odio nunc.',
            },
            {
              type: fsify.FILE,
              name: '-СлаваУкраїні!',
              contents: 'Glory to Ukraine!',
            },
          ],
        },
        {
          type: fsify.FILE,
          name: 'Brasileirão de Seleções.txt',
          contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          type: fsify.FILE,
          name: 'ウクライナ.txt',
        },
      ],
    },
  ];
};
