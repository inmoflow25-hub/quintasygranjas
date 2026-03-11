"use client"

import { useEffect, useState } from "react"

export default function Home() {

const [users,setUsers] = useState(0)

useEffect(()=>{
setUsers(37)
},[])

return (

<main style={{
fontFamily:"system-ui",
maxWidth:"1100px",
margin:"auto",
padding:"40px 20px"
}}>

{/* HERO */}

<section style={{marginBottom:60}}>

<h1 style={{
fontSize:48,
fontWeight:700,
marginBottom:20
}}>
Caja semanal directo de la quinta
</h1>

<p style={{
fontSize:20,
maxWidth:700,
lineHeight:1.4
}}>
Frutas, verduras y productos de granja entregados en tu casa todas las semanas.
Sin supermercado. Sin filas. Sin perder tiempo.
</p>

<p style={{
marginTop:20,
fontSize:18
}}>
Primera compra con precio especial para que pruebes el sistema.
</p>

</section>


{/* COMO FUNCIONA */}

<section style={{marginBottom:80}}>

<h2 style={{fontSize:32,marginBottom:20}}>Cómo funciona</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:20
}}>

<div>
<h3>1. Elegís tu caja</h3>
<p>Seleccionás el tipo de caja semanal que querés recibir.</p>
</div>

<div>
<h3>2. Armamos el pedido</h3>
<p>Compramos en mercado y quintas productos frescos de estación.</p>
</div>

<div>
<h3>3. Llega a tu casa</h3>
<p>Entrega semanal directa a domicilio.</p>
</div>

</div>

</section>


{/* CAJAS */}

<section style={{marginBottom:80}}>

<h2 style={{fontSize:32,marginBottom:30}}>
Elegí tu caja semanal
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
gap:25
}}>


{/* CAJA VEGGIE */}

<div style={{
border:"1px solid #e5e5e5",
padding:25,
borderRadius:10
}}>

<h3>Caja Veggie</h3>

<p style={{fontSize:28,fontWeight:700}}>
$8.000
</p>

<p>Primera compra</p>

<ul>
<li>Frutas y verduras de estación</li>
<li>Aproximadamente 9kg</li>
<li>Entrega semanal</li>
</ul>

<button style={btn}>
Probar esta caja
</button>

</div>


{/* CAJA CAMPO */}

<div style={{
border:"2px solid #2e7d32",
padding:25,
borderRadius:10
}}>

<h3>Caja Campo</h3>

<p style={{fontSize:28,fontWeight:700}}>
$14.000
</p>

<p>Primera compra</p>

<ul>
<li>Caja veggie completa</li>
<li>Maple de huevos</li>
<li>Pollo fresco</li>
</ul>

<button style={btn}>
Elegir caja campo
</button>

</div>


{/* CAJA GRANJA */}

<div style={{
border:"1px solid #e5e5e5",
padding:25,
borderRadius:10
}}>

<h3>Caja Granja</h3>

<p style={{fontSize:28,fontWeight:700}}>
$18.000
</p>

<p>Primera compra</p>

<ul>
<li>Caja campo completa</li>
<li>Pan de campo</li>
<li>Miel natural</li>
</ul>

<button style={btn}>
Elegir caja granja
</button>

</div>

</div>

</section>


{/* ZONAS */}

<section style={{marginBottom:80}}>

<h2 style={{fontSize:32,marginBottom:20}}>
Zonas de entrega
</h2>

<p style={{fontSize:18}}>
Entregamos semanalmente en zona norte del Gran Buenos Aires.
</p>

<ul style={{marginTop:20,lineHeight:1.7}}>
<li>Vicente López</li>
<li>Olivos</li>
<li>Martínez</li>
<li>San Isidro</li>
<li>Acassuso</li>
<li>Tigre</li>
<li>Nordelta</li>
<li>Benavídez</li>
<li>Ingeniero Maschwitz</li>
<li>Escobar</li>
</ul>

</section>


{/* COUNTER */}

<section style={{
marginBottom:80,
background:"#f5f5f5",
padding:30,
borderRadius:10
}}>

<h2 style={{fontSize:28}}>
{users}+ personas ya están usando este sistema
</h2>

<p style={{marginTop:10}}>
Cada semana más familias reciben su caja directamente en casa.
</p>

</section>


{/* CTA FINAL */}

<section>

<h2 style={{fontSize:32}}>
Probá tu primera caja esta semana
</h2>

<button style={{...btn,fontSize:18,marginTop:20}}>
Reservar por WhatsApp
</button>

</section>

</main>

)
}

const btn = {
marginTop:15,
padding:"12px 18px",
background:"#2e7d32",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer"
}
