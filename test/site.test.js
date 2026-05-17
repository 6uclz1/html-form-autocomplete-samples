import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import * as parse5 from "parse5";
import { formatSerialNumber } from "../assets/main.js";

const root = new URL("../", import.meta.url);

const pages = [
  "index.html",
  "forms/contact.html",
  "forms/account-login.html",
  "forms/account-register.html",
  "forms/password-change.html",
  "forms/payment.html",
  "forms/otp.html",
  "forms/serial-number.html",
  "forms/all-in-one.html"
];

const requiredMdnUrls = [
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/pattern",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/required",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label",
  "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation"
];

const expectedInputs = new Map([
  ["email", { type: "email", autocomplete: "email" }],
  ["tel", { type: "tel", autocomplete: "tel" }],
  ["mobile-tel", { type: "tel", autocomplete: "mobile tel" }],
  ["username", { type: "text", autocomplete: "username" }],
  ["current-password", { type: "password", autocomplete: "current-password" }],
  ["new-password", { type: "password", autocomplete: "new-password" }],
  ["confirm-password", { type: "password", autocomplete: "new-password" }],
  ["otp", { type: "text", autocomplete: "one-time-code", inputmode: "numeric" }],
  ["cc-name", { type: "text", autocomplete: "cc-name" }],
  ["cc-number", { type: "text", autocomplete: "cc-number", inputmode: "numeric" }],
  ["cc-exp", { type: "text", autocomplete: "cc-exp", inputmode: "numeric" }],
  ["cc-exp-month", { type: "text", autocomplete: "cc-exp-month", inputmode: "numeric" }],
  ["cc-exp-year", { type: "text", autocomplete: "cc-exp-year", inputmode: "numeric" }],
  ["cc-csc", { type: "text", autocomplete: "cc-csc", inputmode: "numeric" }],
  ["billing-postal-code", { type: "text", autocomplete: "billing postal-code" }],
  ["shipping-postal-code", { type: "text", autocomplete: "shipping postal-code" }],
  ["serial-number", { type: "text", autocomplete: "off" }]
]);

function readProjectFile(path) {
  return readFileSync(new URL(path, root), "utf8");
}

function attrs(node) {
  return Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
}

function walk(node, predicate, results = []) {
  if (predicate(node)) {
    results.push(node);
  }

  for (const child of node.childNodes ?? []) {
    walk(child, predicate, results);
  }

  return results;
}

function parseHtml(path) {
  return parse5.parse(readProjectFile(path), { sourceCodeLocationInfo: true });
}

test("expected files exist", () => {
  for (const page of pages) {
    assert.equal(existsSync(new URL(page, root)), true, `${page} should exist`);
  }

  for (const path of [
    "assets/styles.css",
    "assets/main.js",
    "docs/test-matrix.md",
    ".github/workflows/pages.yml"
  ]) {
    assert.equal(existsSync(new URL(path, root)), true, `${path} should exist`);
  }
});

test("forms use explicit labels, names, ids, autocomplete, and submit buttons", () => {
  for (const page of pages.filter((path) => path !== "index.html")) {
    const document = parseHtml(page);
    const forms = walk(document, (node) => node.nodeName === "form");

    assert.ok(forms.length > 0, `${page} should contain forms`);

    for (const form of forms) {
      const formAttrs = attrs(form);
      assert.equal(formAttrs.autocomplete, "on", `${page} form should opt into autocomplete`);
      assert.equal(formAttrs.action ?? "", "", `${page} form should not have external action`);

      const submitButtons = walk(form, (node) => {
        if (node.nodeName !== "button") return false;
        const buttonAttrs = attrs(node);
        return buttonAttrs.type === "submit";
      });
      assert.ok(submitButtons.length > 0, `${page} form should include a submit button`);

      const labelTargets = new Set(
        walk(form, (node) => node.nodeName === "label").map((label) => attrs(label).for)
      );

      for (const input of walk(form, (node) => node.nodeName === "input")) {
        const inputAttrs = attrs(input);
        assert.ok(inputAttrs.id, `${page} input should have id`);
        assert.ok(inputAttrs.name, `${page} input ${inputAttrs.id} should have name`);
        assert.ok(inputAttrs.autocomplete, `${page} input ${inputAttrs.id} should have autocomplete`);
        assert.equal(labelTargets.has(inputAttrs.id), true, `${page} input ${inputAttrs.id} should have matching label`);

        if (inputAttrs.pattern) {
          assert.ok(inputAttrs["aria-describedby"], `${page} input ${inputAttrs.id} with pattern should have aria-describedby`);
          assert.ok(inputAttrs.title, `${page} input ${inputAttrs.id} with pattern should have title`);
        }
      }
    }
  }
});

test("canonical sample inputs use expected autocomplete tokens and keyboard hints", () => {
  const inputsById = new Map();

  for (const page of pages.filter((path) => path !== "index.html")) {
    const document = parseHtml(page);

    for (const input of walk(document, (node) => node.nodeName === "input")) {
      const inputAttrs = attrs(input);
      if (!inputsById.has(inputAttrs.id)) {
        inputsById.set(inputAttrs.id, inputAttrs);
      }
    }
  }

  for (const [id, expectation] of expectedInputs) {
    const inputAttrs = inputsById.get(id);
    assert.ok(inputAttrs, `site should include #${id}`);

    for (const [name, value] of Object.entries(expectation)) {
      assert.equal(inputAttrs[name], value, `#${id} should set ${name}="${value}"`);
    }
  }
});

test("MDN sources and safety notice are visible", () => {
  const allHtml = pages.map((page) => readProjectFile(page)).join("\n");

  for (const url of requiredMdnUrls) {
    assert.ok(allHtml.includes(url), `${url} should be shown in the site`);
  }

  for (const phrase of [
    "実際のメールアドレス",
    "入力内容は送信・保存されません",
    "ブラウザー、OS、保存済みプロファイル"
  ]) {
    assert.ok(allHtml.includes(phrase), `Safety phrase missing: ${phrase}`);
  }
});

test("client JavaScript prevents submit and does not persist or transmit values", () => {
  const js = readProjectFile("assets/main.js");

  assert.match(js, /preventDefault\(\)/);
  assert.match(js, /reportValidity\(\)/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|console\.log/);
});

test("serial number formatter uppercases and inserts hyphens every four characters", () => {
  assert.equal(formatSerialNumber("abcd1234efgh"), "ABCD-1234-EFGH");
  assert.equal(formatSerialNumber("1234-5678 9012 3456"), "1234-5678-9012-3456");
  assert.equal(formatSerialNumber("ab!@cd_ef"), "ABCD-EF");
  assert.equal(formatSerialNumber("abcd".repeat(10)), "ABCD-ABCD-ABCD-ABCD-ABCD-ABCD-ABCD-ABCD");
});

test("serial number inputs opt into automatic grouping", () => {
  for (const page of ["forms/serial-number.html", "forms/all-in-one.html"]) {
    const document = parseHtml(page);
    const serialInput = walk(document, (node) => {
      if (node.nodeName !== "input") return false;
      const inputAttrs = attrs(node);
      return inputAttrs.id === "serial-number";
    });

    assert.equal(serialInput.length, 1, `${page} should contain one serial number input`);
    assert.equal(attrs(serialInput[0])["data-serial-format"], "groups-of-4");
  }
});

test("GitHub Pages workflow deploys static files without credentials", () => {
  const workflow = readProjectFile(".github/workflows/pages.yml");

  assert.match(workflow, /deploy-pages/);
  assert.match(workflow, /upload-pages-artifact/);
  assert.match(workflow, /pages:\s+write/);
  assert.match(workflow, /id-token:\s+write/);
  assert.doesNotMatch(workflow, /password|secrets\.|api[_-]?key|personal[_-]?access[_-]?token/i);
});
