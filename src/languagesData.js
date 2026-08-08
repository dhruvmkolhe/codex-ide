/* eslint-disable no-template-curly-in-string */
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';

// Custom high-fidelity color indicator for each language dot
export const getLangColor = (langId) => {
  const colors = {
    // Programming Languages
    python: '#3572A5',
    java: '#b07219',
    c: '#555555',
    cpp: '#f34b7d',
    javascript: '#f1e05a',
    lua: '#000080',
    php: '#4F5D95',
    nodejs: '#215732',
    csharp: '#178600',
    assembly: '#6E4C13',
    bash: '#89e051',
    tkinter: '#3572A5',
    vb: '#945db7',
    kotlin: '#A97BFF',
    pascal: '#E3F171',
    ruby: '#701516',
    groovy: '#427819',
    scala: '#c22d40',
    prolog: '#74283c',
    tcl: '#e4cc98',
    typescript: '#3178c6',
    matplotlib: '#116329',
    jshell: '#b07219',
    haskell: '#5e5086',
    ada: '#02f88c',
    lisp: '#3fb68b',
    d: '#ba595e',
    elixir: '#6e4a7e',
    erlang: '#B83998',
    fsharp: '#b845fc',
    fortran: '#4d41b1',
    python2: '#3572A5',
    perl: '#0298c3',
    go: '#00ADD8',
    javaswing: '#b07219',
    javafx: '#b07219',
    avalonia: '#178600',
    raylib: '#f34b7d',
    r: '#198CE7',
    racket: '#3c5caa',
    ocaml: '#ef7a08',
    basic: '#ff0000',
    sh: '#89e051',
    clojure: '#db5855',
    cobol: '#5b8a99',
    rust: '#dea584',
    swift: '#F05138',
    objectivec: '#438eff',
    octave: '#b07219',
    text: '#aaaaaa',
    brainfuck: '#2f2f2f',
    coffeescript: '#244776',
    ejs: '#a91e50',
    dart: '#00B4AB',
    deno: '#3178c6',
    bun: '#f1e05a',
    turtle: '#3572a5',
    seaborn: '#3572a5',
    pygame: '#3572a5',
    crystal: '#000100',
    julia: '#a270ba',
    zig: '#ec915c',
    awk: '#c30e9b',
    ispc: '#555555',
    smalltalk: '#596706',
    nim: '#37775b',
    scheme: '#1e4aec',
    j: '#9e348a',
    v: '#4f87c4',
    raku: '#0000ff',
    verilog: '#b2b7f8',
    haxe: '#df7900',
    forth: '#3737af',
    icon: '#a2a2a2',
    odin: '#60a5fa',

    // Web & Frontend
    html: '#e34c26',
    react: '#61dafb',
    vue: '#41b883',
    angular: '#dd1b16',
    materialize: '#ff6e40',
    bootstrap: '#7952b3',
    tailwindcss: '#38bdf8',
    htmx: '#3d72d7',
    alpinejs: '#77c1d2',
    chartjs: '#ff6384',
    d3js: '#f9a03f',
    jquery: '#0769ad',
    foundation: '#00a6c0',
    bulma: '#00d1b2',
    uikit: '#1e87f0',
    semanticui: '#35bdb2',
    skeleton: '#222222',
    milligram: '#9b4dca',
    papercss: '#41403e',
    backbonejs: '#0071b5',

    // Databases
    mysql: '#00758f',
    oracle: '#f80000',
    postgres: '#336791',
    mongodb: '#4db33d',
    sqlite: '#003b57',
    redis: '#d82c20',
    mariadb: '#003545',
    plsql: '#f80000',
    mssql: '#e42426',
    cassandra: '#307ba8',
    questdb: '#56c28f',
    duckdb: '#fff100',
    surrealdb: '#ff00a0',
    firebird: '#ff5f00',
    clickhouse: '#fc0',
  };
  return colors[langId] || '#607d8b';
};

export const LANGUAGE_CATEGORIES = {
  programming: {
    label: 'Programming Languages',
    languages: [
      { id: 'python', label: 'Python', ext: 'py' },
      { id: 'java', label: 'Java', ext: 'java' },
      { id: 'c', label: 'C', ext: 'c' },
      { id: 'cpp', label: 'C++', ext: 'cpp' },
      { id: 'javascript', label: 'JavaScript', ext: 'js' },
      { id: 'lua', label: 'Lua', ext: 'lua' },
      { id: 'php', label: 'PHP', ext: 'php' },
      { id: 'nodejs', label: 'NodeJS', ext: 'js' },
      { id: 'csharp', label: 'C#', ext: 'cs' },
      { id: 'assembly', label: 'Assembly', ext: 'asm' },
      { id: 'bash', label: 'Bash', ext: 'sh' },
      { id: 'tkinter', label: 'Tkinter', ext: 'py' },
      { id: 'vb', label: 'VB.NET', ext: 'vb' },
      { id: 'kotlin', label: 'Kotlin', ext: 'kt' },
      { id: 'pascal', label: 'Pascal', ext: 'pas' },
      { id: 'ruby', label: 'Ruby', ext: 'rb' },
      { id: 'groovy', label: 'Groovy', ext: 'groovy' },
      { id: 'scala', label: 'Scala', ext: 'scala' },
      { id: 'prolog', label: 'Prolog', ext: 'pl' },
      { id: 'tcl', label: 'Tcl', ext: 'tcl' },
      { id: 'typescript', label: 'TypeScript', ext: 'ts' },
      { id: 'matplotlib', label: 'Matplotlib', ext: 'py' },
      { id: 'jshell', label: 'JShell', ext: 'java' },
      { id: 'haskell', label: 'Haskell', ext: 'hs' },
      { id: 'ada', label: 'Ada', ext: 'adb' },
      { id: 'lisp', label: 'CommonLisp', ext: 'lisp' },
      { id: 'd', label: 'D', ext: 'd' },
      { id: 'elixir', label: 'Elixir', ext: 'ex' },
      { id: 'erlang', label: 'Erlang', ext: 'erl' },
      { id: 'fsharp', label: 'F#', ext: 'fs' },
      { id: 'fortran', label: 'Fortran', ext: 'f90' },
      { id: 'python2', label: 'Python2', ext: 'py' },
      { id: 'perl', label: 'Perl', ext: 'pl' },
      { id: 'go', label: 'Go', ext: 'go' },
      { id: 'javaswing', label: 'Java Swing', ext: 'java' },
      { id: 'javafx', label: 'JavaFX', ext: 'java' },
      { id: 'avalonia', label: 'Avalonia', ext: 'cs' },
      { id: 'raylib', label: 'raylib', ext: 'cpp' },
      { id: 'r', label: 'R', ext: 'r' },
      { id: 'racket', label: 'Racket', ext: 'rkt' },
      { id: 'ocaml', label: 'OCaml', ext: 'ml' },
      { id: 'basic', label: 'Basic', ext: 'bas' },
      { id: 'sh', label: 'sh (Shell Script)', ext: 'sh' },
      { id: 'clojure', label: 'Clojure', ext: 'clj' },
      { id: 'cobol', label: 'Cobol', ext: 'cob' },
      { id: 'rust', label: 'Rust', ext: 'rs' },
      { id: 'swift', label: 'Swift', ext: 'swift' },
      { id: 'objectivec', label: 'Objective-C', ext: 'm' },
      { id: 'octave', label: 'Octave', ext: 'm' },
      { id: 'text', label: 'Text', ext: 'txt' },
      { id: 'brainfuck', label: 'BrainFK', ext: 'bf' },
      { id: 'coffeescript', label: 'CoffeeScript', ext: 'coffee' },
      { id: 'ejs', label: 'EJS', ext: 'ejs' },
      { id: 'dart', label: 'Dart', ext: 'dart' },
      { id: 'deno', label: 'Deno', ext: 'ts' },
      { id: 'bun', label: 'Bun', ext: 'js' },
      { id: 'turtle', label: 'Turtle', ext: 'py' },
      { id: 'seaborn', label: 'Seaborn', ext: 'py' },
      { id: 'pygame', label: 'Pygame', ext: 'py' },
      { id: 'crystal', label: 'Crystal', ext: 'cr' },
      { id: 'julia', label: 'Julia', ext: 'jl' },
      { id: 'zig', label: 'Zig', ext: 'zig' },
      { id: 'awk', label: 'AWK', ext: 'awk' },
      { id: 'ispc', label: 'ISPC', ext: 'ispc' },
      { id: 'smalltalk', label: 'Smalltalk', ext: 'st' },
      { id: 'nim', label: 'Nim', ext: 'nim' },
      { id: 'scheme', label: 'Scheme', ext: 'scm' },
      { id: 'j', label: 'J', ext: 'ijs' },
      { id: 'v', label: 'V', ext: 'v' },
      { id: 'raku', label: 'Raku', ext: 'raku' },
      { id: 'verilog', label: 'Verilog', ext: 'v' },
      { id: 'haxe', label: 'Haxe', ext: 'hx' },
      { id: 'forth', label: 'Forth', ext: 'fs' },
      { id: 'icon', label: 'Icon', ext: 'icn' },
      { id: 'odin', label: 'Odin', ext: 'odin' },
    ],
  },
  web: {
    label: 'Web & Frontend Frameworks',
    languages: [
      { id: 'html', label: 'HTML', ext: 'html' },
      { id: 'css', label: 'CSS', ext: 'css' },
      { id: 'markdown', label: 'Markdown', ext: 'md' },
      { id: 'react', label: 'React', ext: 'html' },
      { id: 'vue', label: 'Vue', ext: 'html' },
      { id: 'angular', label: 'Angular', ext: 'html' },
      { id: 'materialize', label: 'Materialize', ext: 'html' },
      { id: 'bootstrap', label: 'Bootstrap', ext: 'html' },
      { id: 'tailwindcss', label: 'Tailwind CSS', ext: 'html' },
      { id: 'htmx', label: 'HTMX', ext: 'html' },
      { id: 'alpinejs', label: 'Alpine.js', ext: 'html' },
      { id: 'chartjs', label: 'Chart.js', ext: 'html' },
      { id: 'd3js', label: 'D3.js', ext: 'html' },
      { id: 'jquery', label: 'JQuery', ext: 'html' },
      { id: 'foundation', label: 'Foundation', ext: 'html' },
      { id: 'bulma', label: 'Bulma', ext: 'html' },
      { id: 'uikit', label: 'Uikit', ext: 'html' },
      { id: 'semanticui', label: 'Semantic UI', ext: 'html' },
      { id: 'skeleton', label: 'Skeleton', ext: 'html' },
      { id: 'milligram', label: 'Milligram', ext: 'html' },
      { id: 'papercss', label: 'PaperCSS', ext: 'html' },
      { id: 'backbonejs', label: 'BackboneJS', ext: 'html' },
    ],
  },
  database: {
    label: 'Database Engines',
    languages: [
      { id: 'mysql', label: 'MySQL', ext: 'sql' },
      { id: 'oracle', label: 'Oracle Database', ext: 'sql' },
      { id: 'postgres', label: 'PostgreSQL', ext: 'sql' },
      { id: 'mongodb', label: 'MongoDB', ext: 'js' },
      { id: 'sqlite', label: 'SQLite', ext: 'sql' },
      { id: 'redis', label: 'Redis', ext: 'redis' },
      { id: 'mariadb', label: 'MariaDB', ext: 'sql' },
      { id: 'plsql', label: 'Oracle PL/SQL', ext: 'sql' },
      { id: 'mssql', label: 'Microsoft SQL Server', ext: 'sql' },
      { id: 'cassandra', label: 'Cassandra', ext: 'sql' },
      { id: 'questdb', label: 'QuestDB', ext: 'sql' },
      { id: 'duckdb', label: 'DuckDB', ext: 'sql' },
      { id: 'surrealdb', label: 'SurrealDB', ext: 'surql' },
      { id: 'firebird', label: 'Firebird', ext: 'sql' },
      { id: 'clickhouse', label: 'ClickHouse', ext: 'sql' },
    ],
  },
};

// Map CodeMirror extensions and API lang fields
export const languageConfig = {
  python: { label: 'Python', apiLang: 'python', ext: 'py', extension: python() },
  java: { label: 'Java', apiLang: 'java', ext: 'java', extension: java() },
  c: { label: 'C', apiLang: 'c', ext: 'c', extension: cpp() },
  cpp: { label: 'C++', apiLang: 'cpp', ext: 'cpp', extension: cpp() },
  javascript: { label: 'JavaScript', apiLang: 'nodejs', ext: 'js', extension: javascript() },
  lua: { label: 'Lua', apiLang: 'lua', ext: 'lua', extension: null },
  php: { label: 'PHP', apiLang: 'php', ext: 'php', extension: null },
  nodejs: { label: 'NodeJS', apiLang: 'nodejs', ext: 'js', extension: javascript() },
  csharp: { label: 'C#', apiLang: 'csharp', ext: 'cs', extension: cpp() },
  assembly: { label: 'Assembly', apiLang: 'assembly', ext: 'asm', extension: null },
  bash: { label: 'Bash', apiLang: 'bash', ext: 'sh', extension: null },
  tkinter: { label: 'Tkinter', apiLang: 'python', ext: 'py', extension: python() },
  vb: { label: 'VB.NET', apiLang: 'vb', ext: 'vb', extension: null },
  kotlin: { label: 'Kotlin', apiLang: 'kotlin', ext: 'kt', extension: cpp() },
  pascal: { label: 'Pascal', apiLang: 'pascal', ext: 'pas', extension: null },
  ruby: { label: 'Ruby', apiLang: 'ruby', ext: 'rb', extension: null },
  groovy: { label: 'Groovy', apiLang: 'groovy', ext: 'groovy', extension: cpp() },
  scala: { label: 'Scala', apiLang: 'scala', ext: 'scala', extension: cpp() },
  prolog: { label: 'Prolog', apiLang: 'prolog', ext: 'pl', extension: null },
  tcl: { label: 'Tcl', apiLang: 'tcl', ext: 'tcl', extension: null },
  typescript: {
    label: 'TypeScript',
    apiLang: 'typescript',
    ext: 'ts',
    extension: javascript({ typescript: true }),
  },
  matplotlib: { label: 'Matplotlib', apiLang: 'python', ext: 'py', extension: python() },
  jshell: { label: 'JShell', apiLang: 'java', ext: 'java', extension: java() },
  haskell: { label: 'Haskell', apiLang: 'haskell', ext: 'hs', extension: null },
  ada: { label: 'Ada', apiLang: 'ada', ext: 'adb', extension: null },
  lisp: { label: 'CommonLisp', apiLang: 'lisp', ext: 'lisp', extension: null },
  d: { label: 'D', apiLang: 'd', ext: 'd', extension: cpp() },
  elixir: { label: 'Elixir', apiLang: 'elixir', ext: 'ex', extension: null },
  erlang: { label: 'Erlang', apiLang: 'erlang', ext: 'erl', extension: null },
  fsharp: { label: 'F#', apiLang: 'fsharp', ext: 'fs', extension: null },
  fortran: { label: 'Fortran', apiLang: 'fortran', ext: 'f90', extension: null },
  python2: { label: 'Python2', apiLang: 'python2', ext: 'py', extension: python() },
  perl: { label: 'Perl', apiLang: 'perl', ext: 'pl', extension: null },
  go: { label: 'Go', apiLang: 'go', ext: 'go', extension: cpp() },
  javaswing: { label: 'Java Swing', apiLang: 'java', ext: 'java', extension: java() },
  javafx: { label: 'JavaFX', apiLang: 'java', ext: 'java', extension: java() },
  avalonia: { label: 'Avalonia', apiLang: 'csharp', ext: 'cs', extension: cpp() },
  raylib: { label: 'raylib', apiLang: 'cpp', ext: 'cpp', extension: cpp() },
  r: { label: 'R', apiLang: 'r', ext: 'r', extension: null },
  racket: { label: 'Racket', apiLang: 'racket', ext: 'rkt', extension: null },
  ocaml: { label: 'OCaml', apiLang: 'ocaml', ext: 'ml', extension: null },
  basic: { label: 'Basic', apiLang: 'basic', ext: 'bas', extension: null },
  sh: { label: 'sh (Shell Script)', apiLang: 'bash', ext: 'sh', extension: null },
  clojure: { label: 'Clojure', apiLang: 'clojure', ext: 'clj', extension: null },
  cobol: { label: 'Cobol', apiLang: 'cobol', ext: 'cob', extension: null },
  rust: { label: 'Rust', apiLang: 'rust', ext: 'rs', extension: cpp() },
  swift: { label: 'Swift', apiLang: 'swift', ext: 'swift', extension: cpp() },
  objectivec: { label: 'Objective-C', apiLang: 'objectivec', ext: 'm', extension: cpp() },
  octave: { label: 'Octave', apiLang: 'octave', ext: 'm', extension: null },
  text: { label: 'Text', apiLang: 'text', ext: 'txt', extension: null },
  brainfuck: { label: 'BrainFK', apiLang: 'brainfuck', ext: 'bf', extension: null },
  coffeescript: {
    label: 'CoffeeScript',
    apiLang: 'coffeescript',
    ext: 'coffee',
    extension: javascript(),
  },
  ejs: { label: 'EJS', apiLang: 'nodejs', ext: 'ejs', extension: javascript() },
  dart: { label: 'Dart', apiLang: 'dart', ext: 'dart', extension: javascript() },
  deno: {
    label: 'Deno',
    apiLang: 'typescript',
    ext: 'ts',
    extension: javascript({ typescript: true }),
  },
  bun: { label: 'Bun', apiLang: 'nodejs', ext: 'js', extension: javascript() },
  turtle: { label: 'Turtle', apiLang: 'python', ext: 'py', extension: python() },
  seaborn: { label: 'Seaborn', apiLang: 'python', ext: 'py', extension: python() },
  pygame: { label: 'Pygame', apiLang: 'python', ext: 'py', extension: python() },
  crystal: { label: 'Crystal', apiLang: 'crystal', ext: 'cr', extension: null },
  julia: { label: 'Julia', apiLang: 'julia', ext: 'jl', extension: null },
  zig: { label: 'Zig', apiLang: 'zig', ext: 'zig', extension: cpp() },
  awk: { label: 'AWK', apiLang: 'awk', ext: 'awk', extension: null },
  ispc: { label: 'ISPC', apiLang: 'c', ext: 'ispc', extension: cpp() },
  smalltalk: { label: 'Smalltalk', apiLang: 'smalltalk', ext: 'st', extension: null },
  nim: { label: 'Nim', apiLang: 'nim', ext: 'nim', extension: null },
  scheme: { label: 'Scheme', apiLang: 'scheme', ext: 'scm', extension: null },
  j: { label: 'J', apiLang: 'j', ext: 'ijs', extension: null },
  v: { label: 'V', apiLang: 'v', ext: 'v', extension: cpp() },
  raku: { label: 'Raku', apiLang: 'raku', ext: 'raku', extension: null },
  verilog: { label: 'Verilog', apiLang: 'verilog', ext: 'v', extension: cpp() },
  haxe: { label: 'Haxe', apiLang: 'haxe', ext: 'hx', extension: null },
  forth: { label: 'Forth', apiLang: 'forth', ext: 'fs', extension: null },
  icon: { label: 'Icon', apiLang: 'icon', ext: 'icn', extension: null },
  odin: { label: 'Odin', apiLang: 'odin', ext: 'odin', extension: cpp() },

  // Web & Frontend Frameworks
  html: { label: 'HTML', apiLang: 'html', ext: 'html', extension: html() },
  react: { label: 'React', apiLang: 'html', ext: 'html', extension: html() },
  vue: { label: 'Vue', apiLang: 'html', ext: 'html', extension: html() },
  angular: { label: 'Angular', apiLang: 'html', ext: 'html', extension: html() },
  materialize: { label: 'Materialize', apiLang: 'html', ext: 'html', extension: html() },
  bootstrap: { label: 'Bootstrap', apiLang: 'html', ext: 'html', extension: html() },
  tailwindcss: { label: 'Tailwind CSS', apiLang: 'html', ext: 'html', extension: html() },
  htmx: { label: 'HTMX', apiLang: 'html', ext: 'html', extension: html() },
  alpinejs: { label: 'Alpine.js', apiLang: 'html', ext: 'html', extension: html() },
  chartjs: { label: 'Chart.js', apiLang: 'html', ext: 'html', extension: html() },
  d3js: { label: 'D3.js', apiLang: 'html', ext: 'html', extension: html() },
  jquery: { label: 'JQuery', apiLang: 'html', ext: 'html', extension: html() },
  foundation: { label: 'Foundation', apiLang: 'html', ext: 'html', extension: html() },
  bulma: { label: 'Bulma', apiLang: 'html', ext: 'html', extension: html() },
  uikit: { label: 'Uikit', apiLang: 'html', ext: 'html', extension: html() },
  semanticui: { label: 'Semantic UI', apiLang: 'html', ext: 'html', extension: html() },
  skeleton: { label: 'Skeleton', apiLang: 'html', ext: 'html', extension: html() },
  milligram: { label: 'Milligram', apiLang: 'html', ext: 'html', extension: html() },
  papercss: { label: 'PaperCSS', apiLang: 'html', ext: 'html', extension: html() },
  backbonejs: { label: 'BackboneJS', apiLang: 'html', ext: 'html', extension: html() },

  // Databases
  mysql: { label: 'MySQL', apiLang: 'mysql', ext: 'sql', extension: null },
  oracle: { label: 'Oracle Database', apiLang: 'oracle', ext: 'sql', extension: null },
  postgres: { label: 'PostgreSQL', apiLang: 'postgres', ext: 'sql', extension: null },
  mongodb: { label: 'MongoDB', apiLang: 'mongodb', ext: 'js', extension: javascript() },
  sqlite: { label: 'SQLite', apiLang: 'sqlite', ext: 'sql', extension: null },
  redis: { label: 'Redis', apiLang: 'redis', ext: 'redis', extension: null },
  mariadb: { label: 'MariaDB', apiLang: 'mariadb', ext: 'sql', extension: null },
  plsql: { label: 'Oracle PL/SQL', apiLang: 'plsql', ext: 'sql', extension: null },
  mssql: { label: 'Microsoft SQL Server', apiLang: 'mssql', ext: 'sql', extension: null },
  cassandra: { label: 'Cassandra', apiLang: 'cassandra', ext: 'sql', extension: null },
  questdb: { label: 'QuestDB', apiLang: 'postgres', ext: 'sql', extension: null },
  duckdb: { label: 'DuckDB', apiLang: 'sqlite', ext: 'sql', extension: null },
  surrealdb: { label: 'SurrealDB', apiLang: 'sqlite', ext: 'surql', extension: null },
  firebird: { label: 'Firebird', apiLang: 'sqlite', ext: 'sql', extension: null },
  clickhouse: { label: 'ClickHouse', apiLang: 'sqlite', ext: 'sql', extension: null },
  css: { label: 'CSS', apiLang: 'css', ext: 'css', extension: css() },
  markdown: { label: 'Markdown', apiLang: 'markdown', ext: 'md', extension: markdown() },
};

export const starterTemplates = {
  python:
    'print("=== Python Sandbox ===")\n# Basic calculation\nnums = [1, 2, 3, 4, 5]\nprint(f"Sum: {sum(nums)}")\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("=== Java Sandbox ===");\n        System.out.println("Hello, Codex User!");\n    }\n}\n',
  c: '#include <stdio.h>\n\nint main() {\n    printf("=== C Sandbox ===\\n");\n    printf("Hello from C!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "=== C++ Sandbox ===" << std::endl;\n    std::cout << "Hello from beautiful C++!" << std::endl;\n    return 0;\n}\n',
  javascript:
    'console.log("=== JavaScript (NodeJS) Sandbox ===");\nconst name = "Codex Developer";\nconsole.log(`Welcome, ${name}!`);\n',
  lua: '-- Lua Sandbox\nprint("=== Lua Sandbox ===")\nfor i = 1, 3 do\n    print("Lua count: " .. i)\nend\n',
  php: '<?php\n// PHP Sandbox\necho "=== PHP Sandbox ===\\n";\n$greeting = "Hello from PHP!";\necho $greeting . "\\n";\n?>\n',
  nodejs:
    'console.log("=== NodeJS Sandbox ===");\nconsole.log("Runtime version:", process.version);\n',
  csharp:
    'using System;\n\npublic class Program {\n    public static void Main() {\n        Console.WriteLine("=== C# Sandbox ===");\n        Console.WriteLine("Hello, Developer!");\n    }\n}\n',
  assembly:
    '; Intel Assembly x86_64\nsection .data\n    msg db "Hello, World!", 10\n\nsection .text\n    global _start\n_start:\n    ; Write syscall (60 in dec / 1 in syscall tables)\n    ; standard hello world program structure\n',
  bash: '#!/bin/bash\necho "=== Bash Sandbox ==="\necho "Current user: $USER"\necho "Shell path: $SHELL"\n',
  tkinter:
    '# Python Tkinter (GUI programming snippet)\nimport sys\nprint("Tkinter playground - script loaded successfully")\nprint("Platform:", sys.platform)\n',
  vb: 'Imports System\n\nModule Program\n    Sub Main()\n        Console.WriteLine("=== VB.NET Sandbox ===")\n        Console.WriteLine("Welcome to Visual Basic!")\n    End Sub\nEnd Module\n',
  kotlin:
    'fun main() {\n    println("=== Kotlin Sandbox ===")\n    val numbers = listOf(1, 2, 3)\n    println("Kotlin List: $numbers")\n}\n',
  pascal:
    "program PascalSandbox;\nbegin\n  writeln('=== Pascal Sandbox ===');\n  writeln('Pascal compiler active!');\nend.\n",
  ruby: '# Ruby Sandbox\nputs "=== Ruby Sandbox ==="\nputs "Hello, Rubyists!"\n',
  groovy:
    '// Groovy Sandbox\nprintln "=== Groovy Sandbox ==="\n[1, 2, 3].each { println "Groovy item: ${it}" }\n',
  scala:
    'object Main {\n  def main(args: Array[String]): Unit = {\n    println("=== Scala Sandbox ===")\n    println("Hello from Scala!")\n  }\n}\n',
  prolog:
    "% Prolog Sandbox\n:- initialization(main).\nmain :- write('=== Prolog Sandbox ==='), nl.\n",
  tcl: '# Tcl Sandbox\nputs "=== Tcl Sandbox ==="\nputs "Hello from Tool Command Language!"\n',
  typescript:
    'const message: string = "=== TypeScript Sandbox ===";\nconsole.log(message);\nconst multiply = (a: number, b: number): number => a * b;\nconsole.log(`Product: ${multiply(5, 6)}`);\n',
  matplotlib:
    '# Matplotlib (Python data plotting preview)\nimport sys\nprint("Matplotlib simulation sandbox ready")\nprint("Python version:", sys.version)\n',
  jshell:
    '// JShell java console simulation\nSystem.out.println("=== JShell Sandbox ===");\nint x = 42;\nSystem.out.println("x = " + x);\n',
  haskell: '-- Haskell Sandbox\nmain :: IO ()\nmain = putStrLn "=== Haskell Sandbox ==="\n',
  ada: 'with Ada.Text_IO; use Ada.Text_IO;\nprocedure Hello is\nbegin\n   Put_Line("=== Ada Sandbox ===");\nend Hello;\n',
  lisp: ';; Common Lisp Sandbox\n(write-line "=== Common Lisp Sandbox ===")\n(format t "Result: ~D~%" (+ 10 20))\n',
  d: 'import std.stdio;\n\nvoid main() {\n    writeln("=== D Language Sandbox ===");\n}\n',
  elixir: '# Elixir Sandbox\nIO.puts "=== Elixir Sandbox ==="\n',
  erlang:
    '% Erlang Sandbox\n-module(program).\n-export([start/0]).\nstart() ->\n    io:format("=== Erlang Sandbox ===~n").\n',
  fsharp: '// F# Sandbox\nprintfn "=== F# Sandbox ==="\n',
  fortran:
    '! Fortran Sandbox\nprogram hello\n  print *, "=== Fortran Sandbox ==="\nend program hello\n',
  python2: 'print "=== Python 2 Sandbox ==="\nprint "Classic division:", 5/2\n',
  perl: '# Perl Sandbox\nprint "=== Perl Sandbox ===\\n";\nprint "Hello from Perl!\\n";\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("=== Go Language Sandbox ===")\n    fmt.Println("Greetings, Gophers!")\n}\n',
  javaswing:
    '// Java Swing UI starter code\nimport javax.swing.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Java Swing UI sandbox running");\n    }\n}\n',
  javafx:
    '// JavaFX UI starter code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("JavaFX sandbox active");\n    }\n}\n',
  avalonia:
    '// Avalonia C# UI starter\nusing System;\n\npublic class Program {\n    public static void Main() {\n        Console.WriteLine("Avalonia C# UI playground initialized");\n    }\n}\n',
  raylib:
    '// Raylib premium gaming loop starter in C++\n#include <iostream>\n\nint main() {\n    std::cout << "Raylib C++ gaming loop simulated successfully!" << std::endl;\n    return 0;\n}\n',
  r: '# R Sandbox\ncat("=== R Programming Sandbox ===\\n")\nnums <- c(10, 20, 30)\ncat("Mean:", mean(nums), "\\n")\n',
  racket: ';; Racket Sandbox\n#lang racket\n(displayln "=== Racket Sandbox ===")\n',
  ocaml: '(* OCaml Sandbox *)\nprint_endline "=== OCaml Sandbox ===";;\n',
  basic: '10 PRINT "=== Basic Sandbox ==="\n20 GOTO 10\n',
  sh: '# sh Shell script\necho "=== shell scripting environment ==="\necho "Current date: $(date)"\n',
  clojure: ';; Clojure Sandbox\n(println "=== Clojure Sandbox ===")\n',
  cobol:
    '      IDENTIFICATION DIVISION.\n      PROGRAM-ID. HELLO-WORLD.\n      PROCEDURE DIVISION.\n          DISPLAY "=== COBOL Sandbox ===".\n          STOP RUN.\n',
  rust: 'fn main() {\n    println!("=== Rust Sandbox ===");\n    let val = 42;\n    println!("Value: {}", val);\n}\n',
  swift: '// Swift Sandbox\nprint("=== Swift Sandbox ===")\n',
  objectivec:
    '// Objective-C Sandbox\n#import <Foundation/Foundation.h>\n\nint main(int argc, const char * argv[]) {\n    @autoreleasepool {\n        NSLog(@"=== Objective-C Sandbox ===");\n    }\n    return 0;\n}\n',
  octave: '# Octave/Matlab Sandbox\ndisp("=== Octave Sandbox ===")\nv = [1, 2, 3];\ndisp(v * 2);\n',
  text: 'This is a premium plain-text sandbox environment.\nWrite down notes, drafts, or documentation here!\n',
  brainfuck:
    '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.',
  coffeescript:
    '# CoffeeScript Sandbox\nmessage = "=== CoffeeScript Sandbox ==="\nconsole.log message\n',
  ejs: '<h1><%= title %></h1>\n<p>Welcome to <%= suiteName %> EJS playground!</p>\n',
  dart: 'void main() {\n  print("=== Dart Sandbox ===");\n  var numbers = [1, 2, 3];\n  print("Dart list: $numbers");\n}\n',
  deno: '// Deno secure JS/TS sandbox\nconsole.log("=== Deno Playground ===");\n',
  bun: '// Bun high performance Javascript runtime sandbox\nconsole.log("=== Bun Playground ===");\n',
  turtle:
    '# Python Turtle Graphics placeholder template\nimport sys\nprint("Turtle playground ready. Python graphics active.")\n',
  seaborn: '# Python Seaborn data plotting sandbox\nprint("Seaborn dataset simulator active")\n',
  pygame:
    '# Python Pygame development sandbox\nprint("Pygame application simulated successfully")\n',
  crystal: '# Crystal Sandbox\nputs "=== Crystal Sandbox ==="\n',
  julia: '# Julia Sandbox\nprintln("=== Julia Sandbox ===")\n',
  zig: 'const std = @import("std");\n\npub fn main() !void {\n    std.debug.print("=== Zig Sandbox ===\\n", .{});\n}\n',
  awk: '# AWK text processor\nBEGIN {\n    print "=== AWK Sandbox ==="\n}\n',
  ispc: '// ISPC compiler sandbox\n#include <stdio.h>\nint main() {\n    printf("=== ISPC Sandbox ===\\n");\n    return 0;\n}\n',
  smalltalk: '"Smalltalk Sandbox"\nTranscript show: \'=== Smalltalk Sandbox ===\'; cr.\n',
  nim: '# Nim Sandbox\necho "=== Nim Sandbox ==="\n',
  scheme: ';; Scheme Sandbox\n(display "=== Scheme Sandbox ===")\n(newline)\n',
  j: "NB. J Sandbox\necho '=== J Sandbox ==='\n",
  v: "// V Language Sandbox\nfn main() {\n    println('=== V Sandbox ===')\n}\n",
  raku: '# Raku/Perl6 Sandbox\nsay "=== Raku Sandbox ===";\n',
  verilog:
    '// Verilog structural design\nmodule main;\n  initial begin\n    $display("=== Verilog Sandbox ===");\n  end\nendmodule\n',
  haxe: 'class Main {\n    static public function main() {\n        trace("=== Haxe Sandbox ===");\n    }\n}\n',
  forth: '\\ Forth Sandbox\n.( === Forth Sandbox === ) CR\n',
  icon: '# Icon Sandbox\nprocedure main()\n    write("=== Icon Sandbox ===")\nend\n',
  odin: '// Odin Sandbox\nimport "core:fmt"\n\nmain :: proc() {\n    fmt.println("=== Odin Sandbox ===")\n}\n',

  // Web Starter Templates (Linked dynamically in the single page HTML sandbox)
  html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>HTML Sandbox</title>\n</head>\n<body>\n    <h1>HTML Starter Playground</h1>\n    <p>Modify index.html or script.js and see live previews!</p>\n</body>\n</html>\n',
  react:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin="anonymous"></script>\n    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin="anonymous"></script>\n    <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"></script>\n</head>\n<body>\n    <div id="root"></div>\n    <script type="text/babel">\n        function App() {\n            return (\n                <div style={{ fontFamily: "sans-serif", padding: 20 }}>\n                    <h1>React CDN Sandbox</h1>\n                    <p>Edit JSX cleanly in real-time!</p>\n                </div>\n            );\n        }\n        ReactDOM.createRoot(document.getElementById("root")).render(<App />);\n    </script>\n</body>\n</html>\n',
  vue: '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://unpkg.com/vue@3/dist/vue.global.js" crossorigin="anonymous"></script>\n</head>\n<body>\n    <div id="app" style="font-family: sans-serif; padding: 20px;">\n        <h1>{{ title }}</h1>\n        <button @click="count++">Count: {{ count }}</button>\n    </div>\n    <script>\n        const { createApp } = Vue;\n        createApp({\n            data() {\n                return {\n                    title: "Vue 3 CDN Sandbox",\n                    count: 0\n                }\n            }\n        }).mount("#app");\n    </script>\n</body>\n</html>\n',
  angular:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js" crossorigin="anonymous"></script>\n</head>\n<body ng-app="myApp" ng-controller="myCtrl" style="font-family: sans-serif; padding: 20px;">\n    <h1>{{title}}</h1>\n    <input type="text" ng-model="name" placeholder="Type here">\n    <p>Hello, {{name || "stranger"}}!</p>\n    <script>\n        var app = angular.module("myApp", []);\n        app.controller("myCtrl", function($scope) {\n            $scope.title = "AngularJS Sandbox";\n        });\n    </script>\n</body>\n</html>\n',
  materialize:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js" crossorigin="anonymous"></script>\n</head>\n<body style="padding: 20px;">\n    <div class="card blue-grey darken-1">\n        <div class="card-content white-text">\n            <span class="card-title">Materialize CSS Card</span>\n            <p>Beautiful material style in Codex.</p>\n        </div>\n    </div>\n</body>\n</html>\n',
  bootstrap:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n</head>\n<body class="container p-4">\n    <h1 class="text-primary">Bootstrap Sandbox</h1>\n    <button class="btn btn-success">Bootstrap Button</button>\n</body>\n</html>\n',
  tailwindcss:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center">\n    <div class="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">\n        <h1 class="text-3xl font-extrabold text-sky-400">Tailwind CSS Sandbox</h1>\n        <p class="mt-2 text-slate-400">Utility-first design directly in Codex.</p>\n    </div>\n</body>\n</html>\n',
  htmx: '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://unpkg.com/htmx.org@1.9.10"></script>\n</head>\n<body style="font-family: sans-serif; padding: 20px;">\n    <h2>HTMX Playground</h2>\n    <button hx-get="https://api.onecompiler.com" hx-target="#result">Get Info</button>\n    <div id="result" style="margin-top: 15px; color: #38bdf8;"></div>\n</body>\n</html>\n',
  alpinejs:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" crossorigin="anonymous"></script>\n</head>\n<body style="font-family: sans-serif; padding: 20px;">\n    <div x-data="{ open: false }">\n        <button @click="open = !open">Toggle Alpine</button>\n        <p x-show="open">Alpine.js is running beautifully in Codex!</p>\n    </div>\n</body>\n</html>\n',
  chartjs:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://cdn.jsdelivr.net/npm/chart.js" crossorigin="anonymous"></script>\n</head>\n<body style="padding: 20px;">\n    <div style="max-width: 400px;"><canvas id="myChart"></canvas></div>\n    <script>\n        new Chart(document.getElementById("myChart"), {\n            type: "bar",\n            data: { labels: ["Red", "Blue", "Yellow"], datasets: [{ data: [12, 19, 3] }] }\n        });\n    </script>\n</body>\n</html>\n',
  d3js: '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://d3js.org/d3.v7.min.js" crossorigin="anonymous"></script>\n</head>\n<body style="font-family: sans-serif; padding: 20px;">\n    <h1>D3.js Visualization</h1>\n    <div id="viz"></div>\n    <script>\n        d3.select("#viz").append("p").text("Generated by D3!").style("color", "orange");\n    </script>\n</body>\n</html>\n',
  jquery:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://code.jquery.com/jquery-3.7.1.min.js" crossorigin="anonymous"></script>\n</head>\n<body style="font-family: sans-serif; padding: 20px;">\n    <h1 id="header">jQuery Sandbox</h1>\n    <button id="btn">Click jQuery</button>\n    <script>\n        $("#btn").click(() => { $("#header").css("color", "red"); });\n    </script>\n</body>\n</html>\n',
  foundation:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.8.1/css/foundation.min.css" crossorigin="anonymous">\n</head>\n<body style="padding: 20px;">\n    <h1 class="primary">Foundation Sandbox</h1>\n    <span class="label success">Success Label</span>\n</body>\n</html>\n',
  bulma:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" crossorigin="anonymous">\n</head>\n<body class="p-4">\n    <h1 class="title has-text-link">Bulma Sandbox</h1>\n    <button class="button is-primary">Bulma Button</button>\n</body>\n</html>\n',
  uikit:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.17.11/dist/css/uikit.min.css" crossorigin="anonymous">\n    <script src="https://cdn.jsdelivr.net/npm/uikit@3.17.11/dist/js/uikit.min.js" crossorigin="anonymous"></script>\n</head>\n<body class="uk-padding">\n    <h1 class="uk-heading-medium">UIkit Sandbox</h1>\n    <span class="uk-badge">UIkit</span>\n</body>\n</html>\n',
  semanticui:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.5.0/semantic.min.css">\n</head>\n<body class="p-4" style="padding: 20px;">\n    <h1>Semantic UI</h1>\n    <button class="ui primary button">Semantic Button</button>\n</body>\n</html>\n',
  skeleton:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css">\n</head>\n<body class="container" style="padding-top: 50px;">\n    <h1>Skeleton UI</h1>\n    <button class="button-primary">Skeleton Primary Button</button>\n</body>\n</html>\n',
  milligram:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">\n</head>\n<body style="padding: 20px;">\n    <h1>Milligram CSS</h1>\n    <button class="button">Milligram Button</button>\n</body>\n</html>\n',
  papercss:
    '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="https://unpkg.com/papercss@1.9.2/dist/paper.min.css">\n</head>\n<body class="paper" style="padding: 20px;">\n    <h1 class="title">PaperCSS</h1>\n    <button class="paper-btn btn-primary">Paper Button</button>\n</body>\n</html>\n',
  backbonejs:
    '<!DOCTYPE html>\n<html>\n<head>\n    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.6/underscore-min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.6.0/backbone-min.js"></script>\n</head>\n<body style="font-family: sans-serif; padding: 20px;">\n    <h1>Backbone.js CDN</h1>\n    <div id="content"></div>\n    <script>\n        var View = Backbone.View.extend({\n            el: "#content",\n            render: function() { this.$el.html("<p>Backbone View loaded successfully!</p>"); }\n        });\n        new View().render();\n    </script>\n</body>\n</html>\n',
  css: '/* Custom styling rules */\nbody {\n  margin: 0;\n  background-color: #0d1117;\n  color: #c9d1d9;\n  font-family: sans-serif;\n}\n',
  markdown:
    '# Markdown Showcase\n\nWelcome to **Codex**, the premium coding playground!\n\n## Features\n- Ultra fast compile times\n- Intelligent AI code help\n- Multi-file code workspace\n',

  // Database Starter Templates (SQL scripts)
  mysql:
    "CREATE TABLE IF NOT EXISTS test (id INT AUTO_INCREMENT PRIMARY KEY, val VARCHAR(100));\nINSERT INTO test (val) VALUES ('Hello MySQL!');\nSELECT * FROM test;\n",
  oracle:
    "CREATE TABLE test (id INT PRIMARY KEY, val VARCHAR2(100));\nINSERT INTO test VALUES (1, 'Hello Oracle!');\nSELECT * FROM test;\n",
  postgres:
    "CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, val VARCHAR(100));\nINSERT INTO test (val) VALUES ('Hello Postgres!');\nSELECT * FROM test;\n",
  mongodb:
    '// MongoDB execution script\ndb.test.insertOne({ val: "Hello MongoDB!" });\ndb.test.find();\n',
  sqlite:
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, val TEXT);\nINSERT INTO test (val) VALUES ('Hello SQLite!');\nSELECT * FROM test;\n",
  redis: '# Redis CLI simulated environment\nSET codex:welcome "Hello Redis!"\nGET codex:welcome\n',
  mariadb:
    "CREATE TABLE IF NOT EXISTS test (id INT AUTO_INCREMENT PRIMARY KEY, val VARCHAR(100));\nINSERT INTO test (val) VALUES ('Hello MariaDB!');\nSELECT * FROM test;\n",
  plsql:
    "BEGIN\n   dbms_output.put_line('=== PL/SQL Sandbox ===');\n   dbms_output.put_line('Hello from Oracle PL/SQL!');\nEND;\n",
  mssql:
    "CREATE TABLE test (id INT IDENTITY PRIMARY KEY, val VARCHAR(100));\nINSERT INTO test (val) VALUES ('Hello MS SQL!');\nSELECT * FROM test;\n",
  cassandra:
    "CREATE TABLE IF NOT EXISTS test (id UUID PRIMARY KEY, val text);\nINSERT INTO test (id, val) VALUES (now(), 'Hello Cassandra!');\nSELECT * FROM test;\n",
  questdb:
    "CREATE TABLE test (id INT, val STRING);\nINSERT INTO test VALUES (1, 'Hello QuestDB!');\nSELECT * FROM test;\n",
  duckdb:
    "CREATE TABLE test (id INT, val VARCHAR);\nINSERT INTO test VALUES (1, 'Hello DuckDB!');\nSELECT * FROM test;\n",
  surrealdb:
    '-- SurrealDB query script\nCREATE test SET val = "Hello SurrealDB!";\nSELECT * FROM test;\n',
  firebird:
    "CREATE TABLE test (id INT PRIMARY KEY, val VARCHAR(100));\nINSERT INTO test VALUES (1, 'Hello Firebird!');\nSELECT * FROM test;\n",
  clickhouse:
    "CREATE TABLE test (id UInt32, val String) ENGINE = Memory;\nINSERT INTO test VALUES (1, 'Hello ClickHouse!');\nSELECT * FROM test;\n",
};

// Global structures for multi-file configurations
export const DEFAULT_MULTI_FILES = {
  javascript: [
    {
      name: 'index.js',
      content:
        '// JavaScript multi-module demonstration\nconst mathHelper = require("./mathHelper.js");\nconsole.log("=== JavaScript Sandbox ===");\nconsole.log("Sum: " + mathHelper.sum([10, 20, 30]));\n',
    },
    {
      name: 'mathHelper.js',
      content: 'exports.sum = (arr) => arr.reduce((acc, curr) => acc + curr, 0);\n',
    },
    {
      name: 'package.json',
      content:
        '{\n  "name": "javascript-sandbox",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {}\n}',
    },
  ],
  python: [
    {
      name: 'main.py',
      content:
        '# Python multi-file demonstration\nfrom sorter import sort_data\nprint("=== Python Sandbox ===")\ndata = [5, 2, 9, 1]\nprint("Sorted:", sort_data(data))\n',
    },
    {
      name: 'sorter.py',
      content: 'def sort_data(arr):\n    return sorted(arr)\n',
    },
  ],
  java: [
    {
      name: 'Main.java',
      content:
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("=== Java Sandbox ===");\n        Helper.sayHello();\n    }\n}\n',
    },
    {
      name: 'Helper.java',
      content:
        'public class Helper {\n    public static void sayHello() {\n        System.out.println("Greetings from Helper!");\n    }\n}\n',
    },
  ],
  cpp: [
    {
      name: 'main.cpp',
      content:
        '#include <iostream>\n#include "helper.h"\n\nint main() {\n    std::cout << "=== C++ Sandbox ===" << std::endl;\n    printMessage();\n    return 0;\n}\n',
    },
    {
      name: 'helper.h',
      content: '#ifndef HELPER_H\n#define HELPER_H\nvoid printMessage();\n#endif\n',
    },
    {
      name: 'helper.cpp',
      content:
        '#include <iostream>\n#include "helper.h"\nvoid printMessage() {\n    std::cout << "Hello from C++ helper module!" << std::endl;\n}\n',
    },
  ],
  c: [
    {
      name: 'main.c',
      content:
        '#include <stdio.h>\n#include "helper.h"\n\nint main() {\n    printf("=== C Sandbox ===\\n");\n    printHello();\n    return 0;\n}\n',
    },
    {
      name: 'helper.h',
      content: '#ifndef HELPER_H\n#define HELPER_H\nvoid printHello();\n#endif\n',
    },
    {
      name: 'helper.c',
      content:
        '#include <stdio.h>\n#include "helper.h"\nvoid printHello() {\n    printf("Hello from C helper!\\n");\n}\n',
    },
  ],
  typescript: [
    {
      name: 'main.ts',
      content:
        'import { Person } from "./types";\nconst user: Person = { name: "Codex Dev", age: 25 };\nconsole.log(`=== TypeScript Sandbox ===\\nUser: ${user.name}`);\n',
    },
    {
      name: 'types.ts',
      content: 'export interface Person {\n  name: string;\n  age: number;\n}\n',
    },
    {
      name: 'package.json',
      content: '{\n  "name": "typescript-sandbox",\n  "version": "1.0.0",\n  "dependencies": {}\n}',
    },
  ],
  html: [
    {
      name: 'index.html',
      content:
        '<!DOCTYPE html>\n<html>\n<head>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1 id="title">HTML Sandbox</h1>\n    <script src="script.js"></script>\n</body>\n</html>\n',
    },
    {
      name: 'style.css',
      content:
        'body { background: #121214; color: #fff; font-family: sans-serif; padding: 20px; }\n',
    },
    {
      name: 'script.js',
      content: 'console.log("HTML shell runtime successfully loaded!");\n',
    },
  ],
};

export const extToLang = {};
Object.keys(languageConfig).forEach((key) => {
  const ext = languageConfig[key].ext;
  if (ext && !extToLang[ext]) {
    extToLang[ext] = key;
  }
});
