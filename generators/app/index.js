'use strict';
const path = require('path');
const Generator = require('yeoman-generator');
const askName = require('inquirer-npm-name');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const extend = require('deep-extend');

const fileList = [
  {
    generatorPath: '.eslintignore',
    projectPath: '.eslintignore',
  },
  {
    generatorPath: '.eslintrc',
    projectPath: '.eslintrc',
  },
  {
    generatorPath: '.gitignore',
    projectPath: '.gitignore',
  },
  {
    generatorPath: 'app.js',
    projectPath: 'src/app.js',
  },
  {
    generatorPath: 'gulpfile.js',
    projectPath: 'gulpfile.js',
  },
  {
    generatorPath: 'index.html',
    projectPath: 'index.html',
  },
  {
    generatorPath: 'main.scss',
    projectPath: 'src/stylesheets/main.scss',
  },
  {
    generatorPath: 'README.md',
    projectPath: 'README.md',
  },
  {
    generatorPath: 'robots.txt',
    projectPath: 'robots.txt',
  },
  {
    generatorPath: 'root.jsx',
    projectPath: 'src/components/root.jsx',
  }
];

module.exports = class extends Generator {
  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.options.name = this.pkg.name;
    this.options.version = this.pkg.version;
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      'Welcome to the react-struggle generator! \n' +
      'I build light react apps for deployment to CDNs! \n' +
      'I use scss for style sheets and jsx!'
    );

    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'What shall I name this app?',
      default: path.basename(process.cwd()) + 'project'
    }, {
      type: 'confirm',
      name: 'skipInstall',
      message: 'Should I skip the install step?'
    }, {
      name: 'keywords',
      message: 'Package keywords (comma to split)',
      when: !this.pkg.keywords,
      filter: words => words.split(/\s*,\s*/g)
    }, {
      name: 'authorName',
      message: 'Author\'s Name',
      when: !this.options.authorName,
      default: this.user.git.name(),
      store: true
    }, {
      name: 'authorEmail',
      message: 'Author\'s Email',
      when: !this.options.authorEmail,
      default: this.user.git.email(),
      store: true
    },{
      name: 'port',
      message: 'App port',
      default: 3000
    }]

    return this.prompt(prompts).then(answers => {
      this.options = extend(this.options, answers);
    });
  }

  default() {
    if (path.basename(this.destinationPath()) !== this.options.name) {
      this.log(
        'Your generator must be inside a folder named ' + this.options.name + '\n' +
        'I\'ll automatically create this folder.'
      );
      mkdirp(this.options.name);
      this.destinationRoot(this.destinationPath(this.options.name));
    }

    const readmeTpl = _.template(this.fs.read(this.templatePath('README.md')));

    var currentPkg = this.fs.readJSON(this.templatePath('_package.json'), {});
    var pkg = extend({
      name: _.kebabCase(this.options.name),
      author: {
        name: this.options.authorName,
        email: this.options.authorEmail
      },
      keywords: []
    }, currentPkg);

    // Combine the keywords
    if (this.options.keywords) {
      pkg.keywords = _.uniq(this.options.keywords.concat(pkg.keywords));
    }

    // Let's extend package.json so we're not overwriting user previous fields
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  writing() {
    fileList.forEach((file) => {
      this.fs.copyTpl(
        this.templatePath(file.generatorPath),
        this.destinationPath(file.projectPath),
        {
          title: this.options.name,
          port: this.options.port
        }
      );
    })
  }

  installing() {
    if (!this.options.skipInstall) {
      this.npmInstall();
    }
  }
};
