(function(global){
  'use strict';
  const byId=id=>document.getElementById(id);
  const all=(sel,root=document)=>[...root.querySelectorAll(sel)];
  const state={pending:null,installPrompt:null,googleReady:false,view:'choice'};

  function safeMessage(err){
    const raw=String(err?.message||'').trim();
    const known=[
      ['incorrect','Email, username, or password is incorrect.'],
      ['already registered','That account already exists.'],
      ['username is already','That username is already registered.'],
      ['invalid or expired','That code is invalid or expired.'],
      ['wait before requesting','Please wait a moment before requesting another code.'],
      ['at least','Please use a stronger password.'],
      ['phone number','Please enter a valid phone number.']
    ];
    const hit=known.find(([key])=>raw.toLowerCase().includes(key));
    return hit?hit[1]:(raw&&raw.length<180&&!/https?:|endpoint|backend|action\b|script\.google|folder.?id|sheet/i.test(raw)?raw:'Something went wrong. Please try again.');
  }
  function setMessage(text='',kind=''){
    const el=byId('loginMessage');if(!el)return;
    el.textContent=text;el.className='lf-login__message'+(kind?' is-'+kind:'');
  }
  function panels(){return all('[data-login-panel]');}
  function showPanel(name,{message='',kind=''}={}){
    state.view=name;
    panels().forEach(p=>p.hidden=p.dataset.loginPanel!==name);
    setMessage(message,kind);
    const focus={signin:'literaryLogin',register:'literaryDisplayName',verify:'literaryVerifyCode',reset:'literaryResetLogin'}[name];
    if(focus)setTimeout(()=>byId(focus)?.focus({preventScroll:true}),30);
  }
  function setBusy(on){
    all('#loginGate button').forEach(button=>{
      if(button.dataset.keepEnabled)return;
      button.disabled=!!on;
    });
  }
  function saveAuth(response){
    const LF=global.LF;if(!LF?.api)return;
    LF.api.token=response?.token||response?.session?.token||'';
    LF.api.user=response?.user||response?.session?.user||null;
    LF.api.saveAuth();
    try{if(LF.state?.settings?.privacy)LF.state.settings.privacy.backendEnabled=true;}catch(_){ }
  }
  function enterApp(response=null,{skip=false}={}){
    if(response)saveAuth(response);
    if(skip)localStorage.setItem('lf.auth.skipLogin','1');else localStorage.removeItem('lf.auth.skipLogin');
    document.body.classList.remove('auth-gated');document.documentElement.classList.remove('auth-gated');
    byId('loginGate')?.setAttribute('aria-hidden','true');
    global.LF?.app?.updateConnection?.();
  }
  function show(){
    localStorage.removeItem('lf.auth.skipLogin');
    document.body.classList.add('auth-gated');document.documentElement.classList.add('auth-gated');
    byId('loginGate')?.removeAttribute('aria-hidden');state.pending=null;showPanel('choice');
  }
  async function getContacts(token){
    const r=await global.LF.api.request('auth.recovery.contacts.list',{}, {token});return r.contacts||[];
  }
  async function addRegistrationPhone(response){
    const value=byId('literaryRegisterPhone')?.value?.trim();
    const token=response?.token||response?.session?.token||'';
    if(!value||!token)return null;
    return global.LF.api.request('auth.recovery.contacts.add',{kind:'phone',value,label:'Backup phone'},{token});
  }
  async function beginPrimaryVerification(response,{required=true}={}){
    const token=response?.token||response?.session?.token||'';const user=response?.user;
    if(!token||!user?.id)throw new Error('Could not start verification.');
    const contacts=await getContacts(token);
    const contact=contacts.find(c=>c.isPrimary)||contacts.find(c=>c.kind==='email')||contacts[0];
    if(!contact)throw new Error('No verification contact is available.');
    state.pending={response,contact,required,nativeTwoFactor:false};
    byId('literaryVerifyLater').hidden=required;
    byId('literaryVerifyResend').hidden=true;
    showPanel('verify',{message:'Enter the six-digit code sent to your email.',kind:'success'});
  }
  function beginNativeTwoFactor(response){
    state.pending={response,nativeTwoFactor:true,required:true};
    byId('literaryVerifyLater').hidden=true;byId('literaryVerifyResend').hidden=false;
    showPanel('verify',{message:`A six-digit sign-in code was sent to your ${response.method==='phone'?'backup phone':'verified email'}${response.destination?` (${response.destination})`:''}.`,kind:'success'});
  }
  function finishPending(){
    const p=state.pending;if(!p)return;
    saveAuth(p.response);state.pending=null;enterApp();
  }
  async function signIn(event){
    event.preventDefault();setBusy(true);setMessage('Signing in…');
    try{
      const login=byId('literaryLogin').value.trim(),password=byId('literaryPassword').value;
      const r=await global.LF.api.request('auth.login',{login,password},{token:''});
      if(r?.twoFactorRequired)beginNativeTwoFactor(r);else enterApp(r);
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function register(event){
    event.preventDefault();
    const password=byId('literaryRegisterPassword').value,confirm=byId('literaryRegisterConfirm').value;
    if(password!==confirm){setMessage('Passwords do not match.','error');return;}
    setBusy(true);setMessage('Creating account…');
    try{
      const r=await global.LF.api.request('auth.register',{
        displayName:byId('literaryDisplayName').value.trim(),
        username:byId('literaryUsername').value.trim(),
        email:byId('literaryRegisterEmail').value.trim(),password
      },{token:''});
      try{await addRegistrationPhone(r);}catch(phoneErr){
        // Account creation remains successful if an optional backup phone could not be added.
        console.warn('Optional backup phone was not added.',phoneErr);
      }
      if(r.verificationEmailSent)await beginPrimaryVerification(r,{required:true});else enterApp(r);
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function verify(){
    const p=state.pending,code=byId('literaryVerifyCode').value.replace(/\s+/g,'');
    if(!p||!code){setMessage('Enter the verification code.','error');return;}
    setBusy(true);setMessage('Checking code…');
    try{
      if(p.nativeTwoFactor){
        const r=await global.LF.api.request('auth.2fa.verify',{
          challengeToken:p.response.challengeToken,code,
          deviceName:navigator.platform||'Browser',platform:navigator.platform||'',userAgent:navigator.userAgent||''
        },{token:''});
        state.pending=null;enterApp(r);
      }else{
        await global.LF.api.request('auth.contact.code.verify',{userId:p.response.user.id,contactId:p.contact.id,code},{token:''});
        finishPending();
      }
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function resendVerification(){
    const p=state.pending;if(!p?.nativeTwoFactor)return;
    setBusy(true);setMessage('Sending another code…');
    try{
      const r=await global.LF.api.request('auth.2fa.resend',{challengeToken:p.response.challengeToken},{token:''});
      p.response={...p.response,...r};setMessage('A new sign-in code was sent.','success');
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function requestReset(){
    const login=byId('literaryResetLogin').value.trim();if(!login){setMessage('Enter your email or username.','error');return;}
    setBusy(true);setMessage('Sending reset code…');
    try{
      await global.LF.api.request('auth.password.reset.request',{login},{token:''});
      byId('literaryResetFields').hidden=false;setMessage('If the account exists, a reset code was sent.','success');byId('literaryResetCode').focus();
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function completeReset(){
    const login=byId('literaryResetLogin').value.trim(),code=byId('literaryResetCode').value.replace(/\s+/g,''),newPassword=byId('literaryResetPassword').value;
    if(!login||!code||!newPassword){setMessage('Enter the reset code and a new password.','error');return;}
    setBusy(true);setMessage('Resetting password…');
    try{
      const r=await global.LF.api.request('auth.password.reset.complete',{login,code,newPassword},{token:''});
      if(r?.twoFactorRequired)beginNativeTwoFactor(r);else enterApp(r);
    }catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  async function recoveryCodeLogin(){
    const login=byId('literaryResetLogin').value.trim(),code=byId('literaryRecoveryCode').value.trim();
    if(!login||!code){setMessage('Enter your email or username and recovery code.','error');return;}
    setBusy(true);setMessage('Checking recovery code…');
    try{const r=await global.LF.api.request('auth.recovery.code.login',{login,code},{token:''});enterApp(r);}
    catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
  }
  function reveal(button){
    const input=byId(button.dataset.reveal);if(!input)return;
    const revealNow=input.type==='password';input.type=revealNow?'text':'password';
    button.textContent=revealNow?'Hide':'Show';button.setAttribute('aria-label',revealNow?'Hide password':'Show password');button.setAttribute('aria-pressed',String(revealNow));
  }
  function loadGoogleScript(){
    if(global.google?.accounts?.id)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const old=document.querySelector('script[data-literary-google]');
      if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return;}
      const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.dataset.literaryGoogle='1';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
    });
  }
  async function setupGoogle(){
    try{
      const cfg=await global.LF.api.request('client.config',{}, {token:''});if(!cfg.googleClientId)return;
      await loadGoogleScript();
      global.google.accounts.id.initialize({client_id:cfg.googleClientId,callback:async result=>{
        if(!result?.credential)return;setBusy(true);setMessage('Signing in with Google…');
        try{const r=await global.LF.api.request('auth.google',{credential:result.credential},{token:''});enterApp(r);}
        catch(err){setMessage(safeMessage(err),'error');}finally{setBusy(false);}
      }});
      all('.googleButtonMount').forEach(mount=>{
        mount.innerHTML='';
        global.google.accounts.id.renderButton(mount,{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:Math.min(360,mount.clientWidth||320)});
      });
      all('.googleSignInFallback').forEach(button=>button.hidden=true);state.googleReady=true;
    }catch(_){/* Email/password access remains available. */}
  }
  async function installApp(){
    if(state.installPrompt){
      state.installPrompt.prompt();try{await state.installPrompt.userChoice;}catch(_){ }
      state.installPrompt=null;return;
    }
    if(global.matchMedia?.('(display-mode: standalone)').matches){setMessage('LiteraryFriend is already installed.','success');return;}
    setMessage('Choose Install app or Add to Home Screen in your browser menu.','success');
  }
  function backToChoice(){state.pending=null;showPanel('choice');}
  function bind(){
    document.documentElement.classList.add('auth-gated');
    all('[data-login-open]').forEach(button=>button.addEventListener('click',()=>showPanel(button.dataset.loginOpen)));
    all('[data-reveal]').forEach(button=>button.addEventListener('click',()=>reveal(button)));
    all('[data-login-back]').forEach(button=>button.addEventListener('click',backToChoice));
    all('[data-login-back-to]').forEach(button=>button.addEventListener('click',()=>showPanel(button.dataset.loginBackTo||'choice')));
    byId('literarySignInForm')?.addEventListener('submit',signIn);byId('literaryRegisterForm')?.addEventListener('submit',register);
    byId('forgotPasswordBtn')?.addEventListener('click',()=>{
      byId('literaryResetLogin').value=byId('literaryLogin').value.trim();
      byId('literaryResetFields').hidden=true;byId('literaryRecoveryLoginFields').hidden=true;showPanel('reset');
    });
    byId('literaryVerifyBtn')?.addEventListener('click',verify);byId('literaryVerifyLater')?.addEventListener('click',finishPending);byId('literaryVerifyResend')?.addEventListener('click',resendVerification);
    byId('literaryRequestReset')?.addEventListener('click',requestReset);byId('literaryCompleteReset')?.addEventListener('click',completeReset);
    byId('literaryShowRecoveryLogin')?.addEventListener('click',()=>{const box=byId('literaryRecoveryLoginFields');box.hidden=!box.hidden;if(!box.hidden)byId('literaryRecoveryCode')?.focus();});
    byId('literaryRecoveryLoginBtn')?.addEventListener('click',recoveryCodeLogin);
    byId('skipLiteraryLogin')?.addEventListener('click',()=>enterApp(null,{skip:true}));
    byId('installLiteraryFriend')?.addEventListener('click',installApp);
    all('.googleSignInFallback').forEach(button=>button.addEventListener('click',()=>setMessage(state.googleReady?'Choose your Google account above.':'Google sign-in is not available right now. You can still use email and password.','error')));
    global.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.installPrompt=event;});
    global.addEventListener('appinstalled',()=>{state.installPrompt=null;setMessage('LiteraryFriend was installed.','success');});
    const alreadySignedIn=!!global.LF?.api?.token,skipped=localStorage.getItem('lf.auth.skipLogin')==='1';
    if(alreadySignedIn||skipped)enterApp();else showPanel('choice');
    setupGoogle();
  }
  global.LFLogin={show,enterApp,showPanel};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})(window);
