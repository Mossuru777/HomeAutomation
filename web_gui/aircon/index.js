$(() => {
    const powerSelect = $("input[name='powerSelect']:radio");
    const modeSelectInput = $("input[name='modeSelect']:radio");
    const modeSelectLabel = modeSelectInput.parent();
    const targetTempOffsetLabel = $("#targetTempOffsetLabel");
    const targetTemp = $("#targetTemp");
    const targetTempUpBtn = $("#targetTempUpBtn");
    const targetTempDownBtn = $("#targetTempDownBtn");
    const targetTempHelpBlock = $("#targetTempHelpBlock");
    const targetTempMinLabel = $("#targetTempMinLabel");
    const targetTempMaxLabel = $("#targetTempMaxLabel");
    const powerfulSelectInput = $("input[name='powerfulSelect']:radio");
    const powerfulSelectLabel = powerfulSelectInput.parent();
    const fanSpeedSelectInput = $("input[name='fanSpeedSelect']:radio");
    const fanSpeedSelectLabel = fanSpeedSelectInput.parent();
    const swingSelectInput = $("input[name='swingSelect']:radio");
    const swingSelectLabel = swingSelectInput.parent();
    const timerModeSelect = $("input[name='timerModeSelect']:radio");
    const timerHour = $("#timerHour");
    const timerHourUpBtn = $("#timerHourUpBtn");
    const timerHourDownBtn = $("#timerHourDownBtn");
    const timerHourHelpBlock = $("#timerHourHelpBlock");

    const setModeSelectDisableState = (isDisabled) => {
        if (isDisabled) {
            modeSelectLabel.addClass("disabled");
            setTempRangeFromMode("disabled");
        } else {
            modeSelectLabel.removeClass("disabled");
            const checkedMode = modeSelectInput.filter(":checked");
            if (checkedMode.length === 1) {
                const mode = $(checkedMode[0]).val();
                setTempRangeFromMode(mode);
            }
        }
    };

    const setTempRangeFromMode = (mode) => {
        const tempRange = {
            auto: [-5, 5, 0, true],
            warm: [14, 30, 19, false],
            cold: [18, 32, 25, false],
            dry: [-2, 2, 0, true]
        };

        const setTempInputDisableState = (isDisabled) => {
            targetTemp.prop("disabled", isDisabled);
            targetTempUpBtn.prop("disabled", isDisabled);
            targetTempDownBtn.prop("disabled", isDisabled);

            if (isDisabled) {
                targetTemp.val("");
                targetTempOffsetLabel.hide();
            }
            isDisabled ? targetTempHelpBlock.hide() : targetTempHelpBlock.show();
        };

        const setTempRange = (min, max, standard, isOffsetTemp) => {
            isOffsetTemp ? targetTempOffsetLabel.show() : targetTempOffsetLabel.hide();

            targetTemp.attr("min", min);
            targetTempMinLabel.text(min);

            targetTemp.attr("max", max);
            targetTempMaxLabel.text(max);

            const currentValue = targetTemp.val() || standard;
            const setValue = currentValue < min || currentValue > max ? standard : currentValue;
            targetTemp.val(setValue).trigger("change");
        };

        if (tempRange[mode]) {
            const range = tempRange[mode];
            setTempInputDisableState(false);
            setTempRange(range[0], range[1], range[2], range[3]);
        } else {
            setTempInputDisableState(true);
        }
    };

    // prevent "disabled" attributed button (checkbox/radio type) click event
    $('.btn-group').on("click", ".disabled", () => false);

    // power select event
    powerSelect.on("change", (event) => {
        const isDisabled = $(event.target).val() === "false";
        setModeSelectDisableState(isDisabled);
        [powerfulSelectLabel, fanSpeedSelectLabel, swingSelectLabel].forEach((element) => {
            if (isDisabled) {
                element.addClass("disabled");
            } else {
                element.removeClass("disabled");
            }
        });
    });

    // mode select event
    modeSelectInput.on("change", (event) => setTempRangeFromMode($(event.target).val()));

    // target temp events
    targetTemp.on("change", () => {
        targetTempUpBtn.prop("disabled", targetTemp.val() >= targetTemp.attr("max"));
        targetTempDownBtn.prop("disabled", targetTemp.val() <= targetTemp.attr("min"));
    });
    targetTempUpBtn.on("click", () => targetTemp[0].stepUp());
    targetTempDownBtn.on("click", () => targetTemp[0].stepDown());

    // timer mode select / hour events
    timerModeSelect.on("change", (event) => {
        const isTimerHourDisabled = $(event.target).val() === "none";
        timerHour.prop("disabled", isTimerHourDisabled);
        timerHourUpBtn.prop("disabled", isTimerHourDisabled);
        timerHourDownBtn.prop("disabled", isTimerHourDisabled);
        isTimerHourDisabled ? timerHour.val("") : timerHour.val(1);
        isTimerHourDisabled ? timerHourHelpBlock.hide() : timerHourHelpBlock.show();
    });
    timerHourUpBtn.on("click", () => timerHour[0].stepUp());
    timerHourDownBtn.on("click", () => timerHour[0].stepDown());
});
