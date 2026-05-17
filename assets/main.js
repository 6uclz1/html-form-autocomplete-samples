const MAX_SERIAL_CHARACTERS = 32;

export function formatSerialNumber(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MAX_SERIAL_CHARACTERS)
    .replace(/(.{4})(?=.)/g, "$1-");
}

function countSerialCharacters(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").length;
}

function bindSerialFormatter(input) {
  input.addEventListener("input", () => {
    const cursor = input.selectionStart ?? input.value.length;
    const serialCharactersBeforeCursor = countSerialCharacters(input.value.slice(0, cursor));
    const formatted = formatSerialNumber(input.value);
    input.value = formatted;

    const nextCursor = formatSerialNumber(formatted.replace(/-/g, "").slice(0, serialCharactersBeforeCursor)).length;
    input.setSelectionRange(nextCursor, nextCursor);
  });
}

function bindFormSubmit(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const output = form.querySelector("[data-form-result]");
    if (output) {
      output.textContent = "検証に成功しました。このサンプルでは値を送信・保存しません。";
    }
  });
}

if (typeof document !== "undefined") {
  document.querySelectorAll("form").forEach(bindFormSubmit);
  document.querySelectorAll("[data-serial-format='groups-of-4']").forEach(bindSerialFormatter);
}
