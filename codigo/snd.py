import numpy as np,wave,subprocess
R=22050
def env(n,a=0.005,r=0.2):
    t=np.arange(n)/R; e=np.minimum(1,t/a)*np.exp(-t/r); return e
def tone(f,d,typ='sin',r=0.2,a=0.005):
    t=np.arange(int(R*d))/R
    if typ=='sin': w=np.sin(2*np.pi*f*t)
    elif typ=='sq': w=np.sign(np.sin(2*np.pi*f*t))*0.5
    else: w=2*(t*f%1)-1
    return w*env(len(t),a,r)
def save(n,x):
    x=x/ (np.abs(x).max()+1e-9)*0.8
    with wave.open('/tmp/s.wav','w') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(R);w.writeframes((x*32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/s.wav','-b:a','64k',f'www/snd/{n}.mp3'])
def mix(*p):
    L=max(len(x) for x in p); o=np.zeros(L)
    for x in p: o[:len(x)]+=x
    return o
def seq(parts):
    return np.concatenate(parts)
save('ding',mix(tone(1318,0.6,r=0.25),tone(1975,0.6,r=0.18)*0.6, np.concatenate([np.zeros(int(R*.08)),tone(2637,0.5,r=0.2)*0.5])))
b=tone(110,0.7,'saw',r=2)+tone(116,0.7,'saw',r=2); b*=np.minimum(1,(0.7-np.arange(len(b))/R)/0.05)
save('buzz',b)
save('beep',tone(880,0.12,'sq',r=0.08))
save('beep0',tone(440,0.5,'sq',r=0.3))
save('chime',seq([tone(f,0.25,r=0.5) for f in (784,988,1175)]+[tone(1568,1.2,r=0.6)]))
# tick bed 4s loop, 120bpm
n=int(R*4); bed=np.zeros(n)
for i in range(16):
    s=int(i*R*0.25); c=tone(2400 if i%2 else 1800,0.03,'sq',r=0.01)*0.4; bed[s:s+len(c)]+=c
    if i%4==0:
        k=tone(60,0.15,r=0.08); bed[s:s+len(k)]+=k*1.2
pad=sum(tone(f,4,'saw',r=99,a=0.5)*0.05 for f in (110,164.8,220)); bed+=pad[:n]
save('tictac',bed)
# synth-pop outro ~16s
bpm=124; beat=60/bpm; n=int(R*beat*32); o=np.zeros(n)
prog=[(220,277,330),(196,247,294),(174.6,220,262),(196,247,294)]
for bar in range(8):
    ch=prog[bar%4]
    for st in range(8):
        s=int((bar*4+st*0.5)*beat*R)
        for f in ch:
            c=tone(f*2,beat*0.45,'saw',r=0.12)*0.12; o[s:s+len(c)]+=c[:n-s]
        bs=tone(ch[0]/2,beat*0.45,'sq',r=0.15)*0.4; o[s:s+len(bs)]+=bs[:n-s]
    for q in range(4):
        s=int((bar*4+q)*beat*R); k=tone(55,0.2,r=0.07)*1.5; o[s:s+len(k)]+=k[:n-s]
        if q%2: h=np.random.randn(int(R*0.1))*env(int(R*0.1),0.001,0.04)*0.4; o[s:s+len(h)]+=h[:n-s]
mel=[659,587,659,784,880,784,659,587]
for i,f in enumerate(mel*4):
    s=int(i*beat*R); c=tone(f*2,beat*0.9,'sq',r=0.3)*0.12; o[s:s+len(c)]+=c[:n-s]
save('outro',o)
