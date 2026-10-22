import json,random
from datos import *
random.seed(7)
Q=[]
def add(q,a,ds,c):
    acc=[x.strip() for x in a.split('/') if x.strip()]
    ds=[d for d in dict.fromkeys(ds) if d.lower()!=acc[0].lower()][:3]
    if len(ds)<3: return
    Q.append({"q":q,"a":acc,"o":ds,"c":c})
def pick(pool,ex,n=3):
    p=[x for x in dict.fromkeys(pool) if x!=ex]; random.shuffle(p); return p[:n]
for l in open('general.txt',encoding='utf8'):
    p=l.strip().split('|')
    if len(p)==5: add(p[0],p[1],p[2:],'General')
P=[l.split('|') for l in PAISES.split('\n')]
caps=[c for _,c,_ in P]; pais=[p for p,_,_ in P]
for p,c,k in P:
    add(f"¿Cuál es la capital de {p}?",c,pick([x for x,y,z in P if z==k and y!=c and x!=p and y!=p] and [y for x,y,z in P if z==k],c),'Geografía')
    if c!=p: add(f"¿De qué país es capital {c}?",p,pick([x for x,y,z in P if z==k],p),'Geografía')
    add(f"¿En qué continente está {p}?",k,pick(['Europa','Asia','África','América','Oceanía'],k),'Geografía')
R=[l.split('|') for l in PROVINCIAS.split('\n')]
coms=[c for *_,c in R]
for p,c,k in R:
    if c!=p: add(f"¿Cuál es la capital de la provincia de {p}?",c,pick([y for x,y,z in R if y!=x],c),'España')
    add(f"¿A qué comunidad autónoma pertenece la provincia de {p}?",k,pick(coms,k),'España')
E=[l.split('|') for l in ELEMENTOS.split('\n')]
for n,s,nm in E:
    add(f"¿Qué elemento químico tiene el símbolo {s}?",nm,pick([z for x,y,z in E],nm),'Ciencia')
    add(f"¿Cuál es el símbolo químico del {nm.lower()}?",s,pick([y for x,y,z in E],s),'Ciencia')
    add(f"¿Qué elemento tiene el número atómico {n}?",nm,pick([z for x,y,z in E],nm),'Ciencia')
O=[l.split('|') for l in OBRAS.split('\n')]
for o,a in O:
    add(f"¿Quién escribió «{o}»?",a,pick([y for x,y in O],a),'Literatura')
C=[l.split('|') for l in CUADROS.split('\n')]
for o,a in C:
    add(f"¿Quién pintó «{o}»?",a,pick([y for x,y in C],a),'Arte')
I=[l.split('|') for l in INVENTOS.split('\n')]
for o,a in I:
    add(f"¿A quién se atribuye {o}?",a,pick([y for x,y in I],a),'Ciencia')
# cálculo mental (pocas y variadas)
ops=set()
while len(ops)<900:
    t=random.choice('xx+-d')
    if t=='x': a,b=random.randint(2,12),random.randint(2,12); r=a*b; q=f"¿Cuánto es {a} por {b}?"
    elif t=='+': a,b=random.randint(11,99),random.randint(11,99); r=a+b; q=f"¿Cuánto es {a} más {b}?"
    elif t=='-': a=random.randint(30,150); b=random.randint(5,a-1); r=a-b; q=f"¿Cuánto es {a} menos {b}?"
    else: b=random.randint(2,10); r=random.randint(2,12); a=b*r; q=f"¿Cuánto es {a} entre {b}?"
    if q in ops: continue
    ops.add(q); ds=list({r+d for d in random.sample([-10,-3,-2,-1,1,2,3,10],5)} - {r})
    add(q,str(r),[str(x) for x in ds if x>=0],'Cálculo')
# romanos
def rom(n):
    v=[(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')];s=''
    for k,c in v:
        while n>=k: s+=c;n-=k
    return s
for n in random.sample(range(4,2100),220):
    add(f"¿Qué número es {rom(n)} en números romanos?",str(n),[str(n+d) for d in (random.choice([-10,10,100]),random.choice([-1,1,5]),random.choice([-5,50,-50]))],'Cálculo')
# siglos
for y in random.sample(range(101,2025),200):
    s=(y-1)//100+1
    add(f"¿En qué siglo está el año {y}?",f"{rom(s)}/{s}/siglo {rom(s)}",[rom(s+d) for d in (-1,1,2 if s<20 else -2)],'Cálculo')
random.shuffle(Q)
from collections import Counter
print(len(Q),Counter(q['c'] for q in Q))
open('../www/js/preguntas.js','w',encoding='utf8').write('window.PREGUNTAS='+json.dumps(Q,ensure_ascii=False,separators=(',',':'))+';')
