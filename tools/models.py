import bpy, math, random, os
from mathutils import Vector
random.seed(31)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(name,color,rough=.7):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True; p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; return m
fur=mat('Golden ochre fur',(0.78,.46,.115)); cream=mat('Warm ivory',(.94,.82,.58)); dark=mat('Charcoal markings',(.027,.017,.025)); green=mat('Jade eyes',(.10,.53,.32),.2); white=mat('Eye whites',(.94,.95,.84),.2); pink=mat('Inner ears',(.40,.18,.17)); accent=mat('Moon turquoise',(.08,.7,.7),.3)
# Spatial texture remains embedded in exported vertex colours.
def ell(name,loc,scale,material,parts=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=loc); o=bpy.context.object; o.name=name; o.scale=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 if parts is not None:parts.append(o)
 return o
def link(name,a,b,r1,r2,material,parts=None):
 d=Vector(b)-Vector(a); bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=r1,radius2=r2,depth=d.length,location=(Vector(a)+Vector(b))/2);o=bpy.context.object;o.name=name;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=True,scale=True);o.data.materials.append(material)
 if parts is not None:parts.append(o)
 return o
parts=[]
ell('ribcage',(0,0,1.43),(.34,.78,.43),fur,parts);ell('waist',(0,.57,1.43),(.25,.55,.28),fur,parts);ell('haunch',(0,.91,1.43),(.33,.35,.36),fur,parts);ell('shoulders',(0,-.51,1.48),(.34,.36,.47),fur,parts);ell('neck',(0,-.79,1.74),(.26,.34,.44),fur,parts);ell('skull',(0,-1.04,2.05),(.36,.37,.36),fur,parts);ell('cheeks',(0,-1.23,1.93),(.29,.29,.22),fur,parts)
bones=[('root',(0,0,0),(0,0,.6),None),('spine',(0,.8,1.4),(0,-.5,1.5),'root'),('neck',(0,-.5,1.5),(0,-1,1.95),'spine'),('head',(0,-1,1.95),(0,-1.35,2.05),'neck')]
for side,x in [('L',.265),('R',-.265)]:
 for label,y in [('front',-.55),('back',.87)]:
  a=(x,y,1.48);b=(x,y+(.13 if label=='front' else -.25),.77);c=(x,y+(-.08 if label=='front' else .18),.20)
  link('upper',a,b,.16,.11,fur,parts);ell('muscle',a,(.17,.25,.30),fur,parts);ell('joint',b,(.11,.13,.14),fur,parts);link('shin',b,c,.095,.065,fur,parts);ell('paw',(x,c[1]-.10,.12),(.12,.22,.115),fur,parts)
  up=label+side;lo=up+'shin';bones.extend([(up,a,b,'spine'),(lo,b,c,up)])
# Long tapering curved tail, merged into the body.
prev=(0,1.07,1.5)
for j in range(1,10):
 p=(.06*math.sin(j*.5),1.07+j*.16,1.5-.35*math.sin(j*.24));link('tail',prev,p,.11-j*.007,.10-j*.007,fur,parts);ell('tail join',p,(.10-j*.006,)*3,fur,parts);bones.append(('tail'+str(j),prev,p,'spine' if j==1 else 'tail'+str(j-1)));prev=p
# Fuse the anatomical volumes into a continuous sculpted surface.
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name='Fuli_continuous_skin';rem=body.modifiers.new('Anatomical fusion','REMESH');rem.mode='VOXEL';rem.voxel_size=.034;bpy.ops.object.modifier_apply(modifier=rem.name);sm=body.modifiers.new('Sculpt smoothing','SMOOTH');sm.factor=1.4;sm.iterations=5;bpy.ops.object.modifier_apply(modifier=sm.name)
# Colour attributes: cream underside and nonuniform spotted coat in object space.
vc=body.data.color_attributes.new(name='Coat',type='BYTE_COLOR',domain='POINT')
spots=[]
for i in range(1200):spots.append((random.uniform(-.36,.36),random.uniform(-1.1,2.6),random.uniform(.15,1.95),random.uniform(.032,.068)))
for v in body.data.vertices:
 x,y,z=body.matrix_world@v.co;c=(.84,.48,.105,1)
 if (z<1.35 and abs(x)<.18 and -.6<y<.8):c=(.91,.78,.54,1)
 elif y>2.10 and int(y*24)%3==0:c=(.035,.024,.025,1)
 else:
  for sx,sy,sz,r in spots:
   if (x-sx)**2+(y-sy)**2+(z-sz)**2<r*r:c=(.045,.026,.022,1);break
 vc.data[v.index].color=c
coat=fur.copy();coat.name='Spotted coat vertex texture';nodes=coat.node_tree.nodes;n=nodes.new('ShaderNodeVertexColor');n.layer_name='Coat';coat.node_tree.links.new(n.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color']);body.data.materials.clear();body.data.materials.append(coat)
face=[]
for s in [-1,1]:
 ell('rounded ear',(s*.29,-.96,2.34),(.135,.095,.18),dark,face);ell('ear interior',(s*.29,-1.031,2.35),(.092,.031,.12),pink,face)
 ell('eye surround',(s*.183,-1.326,2.095),(.146,.055,.128),dark,face);ell('eye white',(s*.183,-1.364,2.10),(.125,.045,.105),white,face);ell('green iris',(s*.179,-1.402,2.10),(.075,.022,.09),green,face);ell('pupil',(s*.179,-1.422,2.10),(.032,.012,.073),dark,face);ell('eye glint',(s*.16,-1.435,2.13),(.019,.008,.023),white,face)
 ell('ivory muzzle',(s*.10,-1.449,1.92),(.138,.105,.09),cream,face)
 # Tear stripe follows the cheek.
 for j in range(5):ell('tear stripe',(s*(.235-j*.012),-1.35-j*.016,2.01-j*.033),(.022,.018,.031),dark,face)
 for j in range(3):ell('whisker dot',(s*(.08+j*.035),-1.54,1.92),(.009,.007,.009),dark,face)
ell('nose',(0,-1.543,1.987),(.082,.045,.045),dark,face);ell('chin',(0,-1.39,1.827),(.15,.15,.055),cream,face)
# Skeleton and smooth distance-based skin weights.
bpy.ops.object.armature_add();arm=bpy.context.object;arm.name='Fuli_Rig';bpy.ops.object.mode_set(mode='EDIT');arm.data.edit_bones.remove(arm.data.edit_bones[0])
for name,a,b,parent in bones:
 eb=arm.data.edit_bones.new(name);eb.head=a;eb.tail=b
 if parent:eb.parent=arm.data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
def distseg(p,a,b):
 a=Vector(a);d=Vector(b)-a;t=max(0,min(1,(p-a).dot(d)/d.length_squared));return (p-(a+d*t)).length
for name,a,b,pa in bones:body.vertex_groups.new(name=name)
for v in body.data.vertices:
 p=body.matrix_world@v.co;x,y,z=p
 candidates=[b for b in bones if b[0]!='root']
 if z>1.26 and y<1.1:candidates=[b for b in bones if b[0] in ['spine','neck','head']]
 elif y>1.12:candidates=[b for b in bones if b[0]=='spine' or b[0].startswith('tail')]
 elif z<1.2:candidates=[b for b in bones if b[0].startswith(('front','back')) and (('L' in b[0])==(x>0))]
 ds=sorted([(distseg(p,b[1],b[2]),b[0]) for b in candidates])[:2];ws=[1/max(.025,d)**5 for d,n in ds];total=sum(ws)
 for (_,n),w in zip(ds,ws):body.vertex_groups[n].add([v.index],w/total,'REPLACE')
mod=body.modifiers.new('Skin','ARMATURE');mod.object=arm;body.parent=arm
for o in face:
 vg=o.vertex_groups.new(name='head');vg.add(list(range(len(o.data.vertices))),1,'REPLACE');m=o.modifiers.new('Head binding','ARMATURE');m.object=arm;o.parent=arm
# Export two baked clips, used and crossfaded by the game.
for clip in ['Idle','Run']:
 arm.animation_data_create();act=bpy.data.actions.new(clip);arm.animation_data.action=act
 for f in range(1,26):
  t=(f-1)/24*math.tau
  for p in arm.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0)
  arm.pose.bones['root'].location.z=(.055*math.sin(t*2) if clip=='Run' else .009*math.sin(t))
  arm.pose.bones['spine'].rotation_euler.x=.09*math.sin(t) if clip=='Run' else .01*math.sin(t)
  for s in ['L','R']:
   for lab in ['front','back']:
    phase=t+(0 if s=='L' else .7)+(0 if lab=='front' else math.pi)
    arm.pose.bones[lab+s].rotation_euler.x=(.75*math.sin(phase) if clip=='Run' else 0)
    arm.pose.bones[lab+s+'shin'].rotation_euler.x=(.5+.65*math.sin(phase+1) if clip=='Run' else 0)
  for j in range(1,10):arm.pose.bones['tail'+str(j)].rotation_euler.y=.055*math.sin(t+j*.35)
  arm.pose.bones['head'].rotation_euler.x=.04*math.sin(t)
  for p in arm.pose.bones:p.keyframe_insert('rotation_euler',frame=f);p.keyframe_insert('location',frame=f)
 track=arm.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,act);arm.animation_data.action=None
bpy.context.scene.frame_set(1)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=ROOT+'/assets/models/fuli.glb',export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_yup=True)
print('MODEL COMPLETE')
