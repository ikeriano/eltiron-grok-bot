import json,subprocess,os
L={
"bienvenida":"¡Muy buenas tardes y bienvenidos a El Tirón! Soy Nacho Tirado, y sí, me llamo así de verdad... bueno, no, pero quedaba perfecto.",
"intro_corta":"Os cuento la historia en un pispás: en 2019 a Pasapalabra le sacaron tarjeta roja del Supremo, y en Telecinco dijeron: ¡rápido, inventad algo con preguntas, mucha prisa y un bote! Y así nací yo. Bueno, el programa. Yo ya existía.",
"hist1":"Agárrate, que te cuento la historia de El Tirón. Corría el año 2019. Pasapalabra llevaba diez años en Telecinco, felices como perdices, hasta que el Tribunal Supremo dio la razón a la británica ITV, dueña del formato original, y Telecinco tuvo que quitarlo de la parrilla de un día para otro. Imagínate el despacho: ¡que se nos va Pasapalabra! ¡Que alguien invente algo! ¡Ya!",
"hist2":"Y alguien inventó El Tirón. Se estrenó el 18 de octubre de 2019, con prisas, como quien hace la maleta diez minutos antes de salir. Era una sección de unos veinte minutos dentro de Sálvame, en su parte Banana y Tomate. Sí, entre exclusivas del corazón y gritos, de repente: ¡preguntas de cultura general! Un contraste más grande que poner un violín en una verbena.",
"hist3":"El primer duelo fue de órdago: Orestes Barbero contra Rafa Castaño, dos leyendas de Pasapalabra. Vamos, como poner a dos campeones del mundo a jugar al parchís. El bote empezó en cincuenta mil euros y en cada programa iba engordando, como yo en Navidad.",
"hist4":"Las reglas: cada uno tenía ciento cincuenta segundos. Había que acertar seguido, tirón tras tirón, doce respuestas en fila para llevarse el bote. Fallabas o pasabas, la escalera volvía a cero y el reloj se paraba. Doce seguidas, que parece fácil, pero prueba tú a acertar doce cosas seguidas un lunes por la mañana.",
"hist5":"En noviembre de 2019 subieron el mínimo de aciertos para seguir de veinte a veinticinco. Y fíjate qué mala suerte: Orestes, después de veintitrés programas, se quedó con veinticuatro aciertos. ¡Veinticuatro! Por uno. Como perder el autobús por medio segundo. Y llegó David Leo, otro gran campeón, a seguir dando guerra.",
"hist6":"A partir del programa setenta y ocho llegó la fase de clasificación: tres aspirantes en el banquillo, cinco segundos por pregunta, y el primero en llegar a siete aciertos se llevaba quinientos euros y pasaba a la final contra el campeón.",
"hist7":"Y en marzo de 2020 llegó el coronavirus, los informativos se adelantaron, y El Tirón se despidió el 10 de marzo de 2020, tras noventa y nueve programas. Noventa y nueve. Uno más y hacíamos fiesta de cien, ¡pero ni eso nos dejó el virus! Y aquí estamos ahora, en tu móvil. ¡Que empiece el tirón!",
"clasif":"Empezamos con la fase de clasificación. Tres aspirantes, cinco segundos por pregunta. Si fallas o pasas, rebote al siguiente. ¡El primero que llegue a siete aciertos se va a la final!",
"final":"¡Llega la final! Ciento cincuenta segundos para cada uno. Doce aciertos seguidos y te llevas el bote. ¡Vamos con los tirones!",
"turno":"Te toca. ¡Tu tiempo empieza ya!",
"rebote":"¡Rebote!",
"bien1":"¡Correcto!","bien2":"¡Muy bien!","bien3":"¡Sí señor!",
"mal1":"No.","mal2":"¡Uy, no!",
"pasa":"Pasa.",
"siete":"¡Siete aciertos! Te llevas quinientos euros y pasas a la final. ¡Enhorabuena!",
"bote":"¡Doce seguidas! ¡Te llevas el bote! ¡Esto es increíble!",
"gana":"¡Tenemos campeón! Con más aciertos, te llevas mil euros y vuelves mañana.",
"pierde":"Esta vez no ha podido ser. ¡Pero ha sido un placer tenerte en El Tirón!",
"min25":"Ojo, no has llegado a los veinticinco aciertos mínimos, así que no hay premio esta vez.",
"proximo":"Y mañana el bote sube cinco mil euros más. ¡Hasta mañana, y que la fuerza del tirón te acompañe!",
"proximo_bote":"Y como alguien se ha llevado el bote, mañana volvemos a empezar con cincuenta mil euros. ¡Hasta mañana!",
"tiempo":"¡Se acabó el tiempo!",
}
os.makedirs('www/voz',exist_ok=True)
for k,t in L.items():
    o=f'www/voz/{k}.mp3'
    if os.path.exists(o): continue
    subprocess.run(['/workspace/piperenv/bin/piper','-m','/workspace/piper/es_ES-davefx-medium.onnx','--length_scale','0.95','-f','/tmp/v.wav'],input=t.encode(),capture_output=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/v.wav','-ac','1','-b:a','48k',o])
open('www/js/voz.js','w').write('window.VOZ='+json.dumps(L,ensure_ascii=False)+';')
