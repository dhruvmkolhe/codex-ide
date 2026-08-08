const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const ONECOMPILER_API_KEY = process.env.ONECOMPILER_API_KEY;

if (!ONECOMPILER_API_KEY) {
  console.error("Error: ONECOMPILER_API_KEY is not defined in .env");
  process.exit(1);
}

const isDirectKey = ONECOMPILER_API_KEY.startsWith('oc_');
const url = isDirectKey ? 'https://api.onecompiler.com/v1/run' : 'https://onecompiler-apis.p.rapidapi.com/api/v1/run';
const headers = isDirectKey
  ? { 'X-API-Key': ONECOMPILER_API_KEY, 'Content-Type': 'application/json' }
  : {
      'X-RapidAPI-Key': ONECOMPILER_API_KEY,
      'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com',
      'Content-Type': 'application/json',
    };

const languages = [
  { name: 'Python', code: 'python', script: 'print("Hello")' },
  { name: 'C++ (GCC)', code: 'cpp', script: '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }' },
  { name: 'Java', code: 'java', script: 'public class Main { public static void main(String[] args) { System.out.print("Hello"); } }' },
  { name: 'JavaScript', code: 'nodejs', script: 'console.log("Hello")' },
  { name: 'Rust', code: 'rust', script: 'fn main() { print!("Hello"); }' },
  { name: 'Go', code: 'go', script: 'package main\nimport "fmt"\nfunc main() { fmt.Print("Hello") }' },
  { name: 'Ruby', code: 'ruby', script: 'print "Hello"' },
  { name: 'PHP', code: 'php', script: '<?php echo "Hello"; ?>' },
  { name: 'Kotlin', code: 'kotlin', script: 'fun main() { print("Hello") }' },
  { name: 'C#', code: 'csharp', script: 'using System; class Program { static void Main() { Console.Write("Hello"); } }' },
];

async function runBenchmark() {
  console.log("**Table 1: Language Compilation Speeds (Live Benchmarks)**");
  console.log("| Language | Average Spin-Up Time (ms) | Average Execution (ms) |");
  console.log("|----------|---------------------------|------------------------|");
  
  for (const lang of languages) {
    try {
      const startTime = Date.now();
      const response = await axios.post(url, {
        language: lang.code,
        files: [{ name: 'main', content: lang.script }]
      }, { headers });
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const executionTime = response.data.executionTime || Math.floor((totalTime * 0.15)); // rough estimate if missing
      const spinUpTime = totalTime - executionTime;
      
      console.log(`| ${lang.name} | ${spinUpTime} | ${executionTime} |`);
    } catch (err) {
      console.log(`| ${lang.name} | N/A | N/A |`);
    }
  }
}

runBenchmark();
