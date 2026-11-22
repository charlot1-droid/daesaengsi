/* @ds-bundle: {"format": 4, "namespace": "Daesaengsi", "components": [{"name": "DialogueBox"}, {"name": "ChoiceBoard"}, {"name": "Timer"}, {"name": "Notify"}, {"name": "PhoneDM"}, {"name": "Notice"}, {"name": "Prop"}, {"name": "StageSplash"}, {"name": "Checkpoint"}, {"name": "QuestionCard"}, {"name": "Lobby"}, {"name": "PlayerScreens"}]} */
(function () {
  var SHAPES = {
    heart: 'M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4 6.4 4c2.4 0 3.9 1.4 5.6 3.4C13.7 5.4 15.2 4 17.6 4c4.1 0 6 4.4 4.4 7.7C19.5 16.4 12 21 12 21z',
    star: 'M12 2.2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.2l-6 3.4 1.3-6.7-5-4.7 6.8-.8z'
  };
  /* CSS-first system: components are class names in bundle.css. Helpers below are optional. */
  window.Daesaengsi = {
    choiceShape: function (n) { return ['heart', 'star', 'clover'][n - 1]; },
    hostScale: function (el) { var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080); el.style.setProperty('--u', s + 'px'); return s; },
    shapePaths: SHAPES
  };
})();
