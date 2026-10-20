// ==UserScript==
// @name               Greasy Fork Webhook Example
// @description        N/A
// @icon               https://wsrv.nl/?url=https://api.mobilecardspro.com/public/images/favicon.ico
// @author             Jason Kwok
// @namespace          https://jasonhk.dev/
// @version            2.0.0
// @license            MIT
// @match              https://api.mobilecardspro.com/m/p/a/seito/*
// @run-at             document-end
// @grant              GM.getValue
// @grant              GM.setValue
// @grant              GM.deleteValue
// @grant              GM.registerMenuCommand
// ==/UserScript==

let t;
{
    const translations =
    {
        "en": {
            COMMAND: "Update Member’s Phone Number",
            MESSAGES: {
                PROMPT: "Please enter your phone number (formatted as “+852-98765432”):",
                DELETED: "Phone number deleted.",
                MALFORMED: "Malformed phone number.",
                NOT_SUPPORTED: "Country code not supported.",
                UPDATED: "Phone number updated.",
            },
        },
        "zh-TW": {
            COMMAND: "更新會員電話號碼",
            MESSAGES: {
                PROMPT: "請輸入你的電話號碼（格式為「+852-98765432」）：",
                DELETED: "電話號碼已被刪除。",
                MALFORMED: "電話號碼格式不正確。",
                NOT_SUPPORTED: "不支援的電話區號。",
                UPDATED: "電話號碼已更新。",
            },
        },
    };

    let locale = "en";
    for (let _locale of navigator.languages.map((language) => new Intl.Locale(language)))
    {
        if (_locale.language === "zh")
        {
            _locale = new Intl.Locale("zh", { region: _locale.maximize().region });
        }
;
        if (_locale.baseName in translations)
        {
            locale = _locale.baseName;
            break;
        }
    }

    t = translations[locale];
}

const PHONE_PATTERN = /^(?<countryCode>\+\d+)-(?<phoneNumber>\d+)$/;

const COUNTRY_CODES = Array
    .from(document.querySelectorAll("[name=memberPhoneAreaCode] > option[value^=\"+\"]"))
    .map((element) => element.value);

const interval = setInterval(() =>
{
    if (document.querySelector("option[value=\"+852\"]").selected)
    {
        clearInterval(interval);
        execute();
    }
}, 100);

async function execute()
{
    const countryCodeSelect = document.querySelector("[name=memberPhoneAreaCode]");
    const phoneNumberField = document.querySelector("[name=memberPhoneNO]");

    const member = await GM.getValue("member");
    if (member)
    {
        const [countryCode, phoneNumber] = member.split("-");
        countryCodeSelect.value = countryCode;
        phoneNumberField.value = phoneNumber;
    }

    GM.registerMenuCommand(t.COMMAND, () =>
    {
        setTimeout(async () =>
        {
            const input = prompt(t.MESSAGES.PROMPT, await GM.getValue("member"));
            if (input === null) { return; }

            if (input === "")
            {
                await GM.deleteValue("member");
                alert(t.MESSAGES.DELETED);
                return;
            }

            const matches = input.match(PHONE_PATTERN);
            if (!matches)
            {
                alert(t.MESSAGES.MALFORMED);
                return;
            }

            if (!COUNTRY_CODES.includes(matches[1]))
            {
                alert(t.MESSAGES.NOT_SUPPORTED);
                return;
            }

            await GM.setValue("member", input);
            alert(t.MESSAGES.UPDATED);
        }, 0);
    });
}
