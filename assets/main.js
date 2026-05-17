document.querySelectorAll("form").forEach((form) => {
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
});
