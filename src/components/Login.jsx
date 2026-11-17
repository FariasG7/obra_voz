export default function Login({ onIrParaCadastro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const res = await autenticarUtilizador(email, password);

    if (res && res.sucesso) {
      await login(res.usuario);
    } else {
      setErro(res?.erro || 'Credenciais inválidas.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>
          <span className="logo-obra">Obra</span><span className="logo-voz">Voz</span>
        </h1>
        <p className="login-subtitulo">Diário de Obra Inteligente</p>

        {erro && <div className="login-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="campo-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required 
            />
          </div>

          <div className="campo-group">
            <label>Senha</label>
            <div className="password-wrapper">
              <input 
                type="password" 
                className="login-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </button>

          {/* Botão / Link para ir para a tela de Cadastro corrigido */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>Ainda não tem conta? </span>
            <button
              type="button"
              onClick={onIrParaCadastro} 
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2AA1C0',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Criar conta
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
