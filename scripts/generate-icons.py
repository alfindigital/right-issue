from PIL import Image, ImageDraw
import colorsys, math

def hsl(h,s,l):
    r,g,b=colorsys.hls_to_rgb(h/360,l/100,s/100)
    return (int(r*255),int(g*255),int(b*255))

TOP=hsl(217,91,56); BOT=hsl(217,91,42)

# logo paths in 24x24 viewBox (from Logo.tsx)
def draw_logo(d, ox, oy, scale):
    def X(v): return ox+v*scale
    def Y(v): return oy+v*scale
    r=1*scale
    d.rounded_rectangle([X(2),Y(15),X(6),Y(21)], radius=r, fill=(255,255,255,255))
    d.rounded_rectangle([X(9),Y(10),X(13),Y(21)], radius=r, fill=(255,255,255,255))
    pts=[(14,10),(16,10),(16,21),(20,21),(20,10),(22,10),(18,2)]
    d.polygon([(X(a),Y(b)) for a,b in pts], fill=(255,255,255,255))

def make(size, maskable):
    im=Image.new("RGBA",(size,size))
    d=ImageDraw.Draw(im)
    for y in range(size):
        t=y/(size-1)
        c=tuple(int(TOP[i]+(BOT[i]-TOP[i])*t) for i in range(3))
        d.line([(0,y),(size,y)], fill=c+(255,))
    if not maskable:
        # rounded square with transparent corners for "any" icons
        mask=Image.new("L",(size,size),0)
        ImageDraw.Draw(mask).rounded_rectangle([0,0,size-1,size-1], radius=int(size*0.22), fill=255)
        im.putalpha(mask)
    # logo: target content width fraction
    frac = 0.45 if maskable else 0.62
    # logo bbox in viewBox: x 2..22 (20), y 2..21 (19)
    scale = size*frac/20
    lw, lh = 20*scale, 19*scale
    ox = (size-lw)/2 - 2*scale
    oy = (size-lh)/2 - 2*scale
    layer=Image.new("RGBA",(size,size),(0,0,0,0))
    draw_logo(ImageDraw.Draw(layer), ox, oy, scale)
    im=Image.alpha_composite(im, layer)
    return im

for s in (192,512):
    make(s,True).save(f"public/icon-{s}-maskable.png")
for s in (16,32,48,96,180,192,384,512):
    make(s,False).save(f"public/icon-{s}.png")
base=make(256,False)
base.save("public/favicon.ico", sizes=[(16,16),(32,32),(48,48)])
base.resize((512,512)).save("public/favicon.png")
print("generated")

# --- safe zone test: simulate Android adaptive icon masks ---
def masks(size):
    out={}
    m=Image.new("L",(size,size),0); ImageDraw.Draw(m).ellipse([0,0,size-1,size-1],fill=255); out["circle"]=m
    m=Image.new("L",(size,size),0); ImageDraw.Draw(m).rounded_rectangle([0,0,size-1,size-1],radius=int(size*0.5*0.55),fill=255); out["squircle"]=m
    m=Image.new("L",(size,size),0); ImageDraw.Draw(m).rounded_rectangle([0,0,size-1,size-1],radius=int(size*0.14),fill=255); out["rounded-square"]=m
    m=Image.new("L",(size,size),0); dd=ImageDraw.Draw(m)
    dd.ellipse([0,0,size-1,size-1],fill=255); dd.rectangle([size//2,0,size-1,size//2],fill=255)
    dd.rounded_rectangle([size//2,0,size-1,size//2],radius=int(size*0.06),fill=255); out["teardrop"]=m
    return out

for s in (192,512):
    im=Image.open(f"public/icon-{s}-maskable.png").convert("RGBA")
    # android crops to central 72dp of 108dp viewport => visible = 66.6% of image
    vis=int(s*2/3); off=(s-vis)//2
    core=im.crop((off,off,off+vis,off+vis))
    px=core.load(); W=core.size[0]
    logo=[(x,y) for y in range(W) for x in range(W) if px[x,y][0]>200 and px[x,y][1]>200 and px[x,y][2]>200]
    print(f"\nicon-{s}-maskable: logo px inside 66.6% viewport: {len(logo)}")
    for name,m in masks(W).items():
        mp=m.load()
        clipped=sum(1 for x,y in logo if mp[x,y]<128)
        print(f"  {name}: clipped={clipped}")
