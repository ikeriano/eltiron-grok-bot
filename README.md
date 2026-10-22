# El Tirón · juego de fans (Android + web)

**▶️ [Jugar en el navegador](https://ikeriano.github.io/eltiron-grok-bot/)** · **📱 [APK v1.2](https://github.com/ikeriano/eltiron-grok-bot/releases/tag/v1.2)**

Juego creado por Iker, inspirado en el concurso de Telecinco (2019-2020). Todo es original: plató 3D (three.js), voz del presentador «Nacho Tirado» (Piper, español de España), sonidos y música sintetizados.

- **Clasificación**: 3 aspirantes, 5 segundos por pregunta, rebote si fallas o pasas; el primero en llegar a 7 aciertos gana 500 € y va a la final.
- **Final**: 150 segundos cada uno. 12 aciertos seguidos = el bote (empieza en 50.000 € y sube 5.000 € por programa). Si nadie lo consigue, gana quien tenga más aciertos (1.000 €), con la regla opcional de mínimo 25.
- 2.400+ preguntas de cultura general; respuesta escrita (tolerante con tildes y erratas) o elegir entre 4 (niños).
- Opciones: nombre, empezar por la clasificación o directo a la final, nivel de rivales, voz, música, calidad gráfica, «Historia del programa».

Estructura: la raíz es la web (y los assets del APK). `android/` es el envoltorio WebView (`com.ikeriano.eltiron`; `build.sh` copia la web a assets y compila con JDK 17, firma con `android/keystore/` que no se sube). `codigo/` genera preguntas (`gen/gen.py`), voces (`voz.py`) y sonidos (`snd.py`).
