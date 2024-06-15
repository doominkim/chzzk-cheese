import{h as E,g as N,s as F,E as Q,_ as a,K as O,r as I,m as U,j as i,v as H,i as x,x as L,k as X,l as Y}from"./index-8fbc9a42.js";import{u as Z,a as ee}from"./Popover-63046ab8.js";import{c as R}from"./Card-bc4c103e.js";function oe(e){return E("PrivateSwitchBase",e)}N("PrivateSwitchBase",["root","checked","disabled","input","edgeStart","edgeEnd"]);const te=["autoFocus","checked","checkedIcon","className","defaultChecked","disabled","disableFocusRipple","edge","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"],ce=e=>{const{classes:o,checked:t,disabled:r,edge:c}=e,n={root:["root",t&&"checked",r&&"disabled",c&&`edge${x(c)}`],input:["input"]};return L(n,oe,o)},ne=F(Q)(({ownerState:e})=>a({padding:9,borderRadius:"50%"},e.edge==="start"&&{marginLeft:e.size==="small"?-3:-12},e.edge==="end"&&{marginRight:e.size==="small"?-3:-12})),se=F("input",{shouldForwardProp:O})({cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}),ae=I.forwardRef(function(o,t){const{autoFocus:r,checked:c,checkedIcon:n,className:u,defaultChecked:C,disabled:B,disableFocusRipple:d=!1,edge:b=!1,icon:z,id:p,inputProps:y,inputRef:P,name:g,onBlur:h,onChange:f,onFocus:m,readOnly:V,required:q=!1,tabIndex:K,type:v,value:w}=o,T=U(o,te),[j,W]=Z({controlled:c,default:!!C,name:"SwitchBase",state:"checked"}),l=ee(),A=s=>{m&&m(s),l&&l.onFocus&&l.onFocus(s)},D=s=>{h&&h(s),l&&l.onBlur&&l.onBlur(s)},G=s=>{if(s.nativeEvent.defaultPrevented)return;const _=s.target.checked;W(_),f&&f(s,_)};let k=B;l&&typeof k>"u"&&(k=l.disabled);const J=v==="checkbox"||v==="radio",S=a({},o,{checked:j,disabled:k,disableFocusRipple:d,edge:b}),M=ce(S);return i.jsxs(ne,a({component:"span",className:H(M.root,u),centerRipple:!0,focusRipple:!d,disabled:k,tabIndex:null,role:void 0,onFocus:A,onBlur:D,ownerState:S,ref:t},T,{children:[i.jsx(se,a({autoFocus:r,checked:c,defaultChecked:C,className:M.input,disabled:k,id:J?p:void 0,name:g,onChange:G,readOnly:V,ref:P,required:q,ownerState:S,tabIndex:K,type:v},v==="checkbox"&&w===void 0?{}:{value:w},y)),j?n:z]}))}),ie=ae,re=R(i.jsx("path",{d:"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}),"CheckBoxOutlineBlank"),le=R(i.jsx("path",{d:"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"}),"CheckBox"),de=R(i.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"}),"IndeterminateCheckBox");function ue(e){return E("MuiCheckbox",e)}const pe=N("MuiCheckbox",["root","checked","disabled","indeterminate","colorPrimary","colorSecondary","sizeSmall","sizeMedium"]),$=pe,he=["checkedIcon","color","icon","indeterminate","indeterminateIcon","inputProps","size","className"],fe=e=>{const{classes:o,indeterminate:t,color:r,size:c}=e,n={root:["root",t&&"indeterminate",`color${x(r)}`,`size${x(c)}`]},u=L(n,ue,o);return a({},o,u)},me=F(ie,{shouldForwardProp:e=>O(e)||e==="classes",name:"MuiCheckbox",slot:"Root",overridesResolver:(e,o)=>{const{ownerState:t}=e;return[o.root,t.indeterminate&&o.indeterminate,o[`size${x(t.size)}`],t.color!=="default"&&o[`color${x(t.color)}`]]}})(({theme:e,ownerState:o})=>a({color:(e.vars||e).palette.text.secondary},!o.disableRipple&&{"&:hover":{backgroundColor:e.vars?`rgba(${o.color==="default"?e.vars.palette.action.activeChannel:e.vars.palette[o.color].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:X(o.color==="default"?e.palette.action.active:e.palette[o.color].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},o.color!=="default"&&{[`&.${$.checked}, &.${$.indeterminate}`]:{color:(e.vars||e).palette[o.color].main},[`&.${$.disabled}`]:{color:(e.vars||e).palette.action.disabled}})),ke=i.jsx(le,{}),xe=i.jsx(re,{}),Ce=i.jsx(de,{}),be=I.forwardRef(function(o,t){var r,c;const n=Y({props:o,name:"MuiCheckbox"}),{checkedIcon:u=ke,color:C="primary",icon:B=xe,indeterminate:d=!1,indeterminateIcon:b=Ce,inputProps:z,size:p="medium",className:y}=n,P=U(n,he),g=d?b:B,h=d?b:u,f=a({},n,{color:C,indeterminate:d,size:p}),m=fe(f);return i.jsx(me,a({type:"checkbox",inputProps:a({"data-indeterminate":d},z),icon:I.cloneElement(g,{fontSize:(r=g.props.fontSize)!=null?r:p}),checkedIcon:I.cloneElement(h,{fontSize:(c=h.props.fontSize)!=null?c:p}),ownerState:f,ref:t,className:H(m.root,y)},P,{classes:m}))}),Be=be;export{Be as C,ie as S};