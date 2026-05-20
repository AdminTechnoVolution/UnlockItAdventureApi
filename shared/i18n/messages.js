const FIELDS = {
    EMAIL: "email",
    PASSWORD: "password",
    FULL_NAME: "fullName",
    REFRESH_TOKEN: "refreshToken",
    ACCESS_TOKEN: "accessToken",
    FCM_TOKEN: "fcmToken",
    VERIFICATION_CODE: "verificationCode",
    GROUP_ID: "groupId",
    PURCHASE_TOKEN: "purchaseToken",
    PRODUCT_ID: "productId",
};

const ERROR_CODES = {
    FIELD_INVALID: "FIELD_INVALID",
    FIELD_MAX: "FIELD_MAX",
    FIELD_MIN: "FIELD_MIN",
    FIELD_NUMBER_ONLY: "FIELD_NUMBER_ONLY",
    FIELD_PATTERN: "FIELD_PATTERN",
    FIELD_REQUIRED: "FIELD_REQUIRED",
    CODE_PHOTOS_ONLY: "CODE_PHOTOS_ONLY",
    CODE_ERROR_LOGIN: "CODE_ERROR_LOGIN",
    CODE_ERROR_AUTH: "CODE_ERROR_AUTH",
    CODE_USER_EXISTS: "CODE_USER_EXISTS",
    CODE_USER_NOT_FOUND: "CODE_USER_NOT_FOUND",
    CODE_EXPIRED_VERIFICATION_CODE: "CODE_EXPIRED_VERIFICATION_CODE",
    CODE_INVALID_VERIFICATION_CODE: "CODE_INVALID_VERIFICATION_CODE",
    CODE_RESEND_VERIFICATION_CODE_TOO_MANY_REQUESTS: "CODE_RESEND_VERIFICATION_CODE_TOO_MANY_REQUESTS",
    CODE_GROUP_NOT_ACTIVE: "CODE_GROUP_NOT_ACTIVE",
    CODE_GROUP_ALREADY_UNLOCKED: "CODE_GROUP_ALREADY_UNLOCKED",
    CODE_GOOGLE_PLAY_VALIDATION_FAILED: "CODE_GOOGLE_PLAY_VALIDATION_FAILED",
    ERROR_BAD_REQUEST_RESPONSE: "ERROR_BAD_REQUEST_RESPONSE",
    ERROR_MALFORMED_BAD_REQUEST: "ERROR_MALFORMED_BAD_REQUEST",
    ERROR_INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};

const SUCCESS_CODES = {
    CODE_REGISTER_SUCCESS: "CODE_REGISTER_SUCCESS",
    CODE_VERIFICATION_SUCCESS: "CODE_VERIFICATION_SUCCESS",
    CODE_RESET_PASSWORD_SUCCESS: "CODE_RESET_PASSWORD_SUCCESS",
    CODE_SENT_SUCCESS: "CODE_SENT_SUCCESS",
    CODE_UNLOCK_GROUP_SUCCESS: "CODE_UNLOCK_GROUP_SUCCESS",
};

const EMAIL_TEMPLATES = {
    USER_REGISTRATION: "TEMPLATE_USER_REGISTRATION",
    VERIFICATION_CODE: "TEMPLATE_VERIFICATION_CODE",
};

const EMAIL_SUBJECTS = {
    VERIFICATION_CODE: "SUBJECT_VERIFICATION_CODE",
};

const TRANSLATIONS = {
    [FIELDS.VERIFICATION_CODE]: {
        en: "verification code",
        es: "código de verificación",
        pt: "código de verificação",
        fr: "code de vérification",
        it: "codice di verifica"
    },
    [FIELDS.GROUP_ID]: {
        en: "group id",
        es: "id de grupo",
        pt: "id do grupo",
        fr: "id du groupe",
        it: "id del gruppo"
    },
    [FIELDS.PURCHASE_TOKEN]: {
        en: "purchase token",
        es: "token de compra",
        pt: "token de compra",
        fr: "jeton d'achat",
        it: "token di acquisto"
    },
    [FIELDS.PRODUCT_ID]: {
        en: "product id",
        es: "id de producto",
        pt: "id do produto",
        fr: "id du produit",
        it: "id del prodotto"
    },
    [FIELDS.EMAIL]: {
        en: "email",
        es: "correo",
        pt: "email",
        fr: "email",
        it: "email"
    },
    [FIELDS.FULL_NAME]: {
        en: "full name",
        es: "nombre completo",
        pt: "nome completo",
        fr: "nom complet",
        it: "nome completo"
    },
    [FIELDS.PASSWORD]: {
        en: "password",
        es: "contraseña",
        pt: "senha",
        fr: "mot de passe",
        it: "password"
    },
    [FIELDS.REFRESH_TOKEN]: {
        en: "refresh token",
        es: "token de actualización",
        pt: "token de atualização",
        fr: "jeton de renouvellement",
        it: "token di aggiornamento"
    },
    [FIELDS.ACCESS_TOKEN]: {
        en: "access token",
        es: "token de acceso",
        pt: "token de acesso",
        fr: "jeton d'accès",
        it: "token di accesso"
    },
    [FIELDS.FCM_TOKEN]: {
        en: "FCM token",
        es: "token FCM",
        pt: "token FCM",
        fr: "jeton FCM",
        it: "token FCM"
    },

    // ERROR CODES
    [ERROR_CODES.CODE_ERROR_AUTH]: {
        en: "Session expired. Please log in again.",
        es: "Sesión expirada. Inicia sesión nuevamente.",
        pt: "Sessão expirada. Faça login novamente.",
        fr: "Session expirée. Veuillez vous reconnecter.",
        it: "Sessione scaduta. Accedi di nuovo."
    },
    [ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE]: {
        en: "Bad request",
        es: "Solicitud incorrecta",
        pt: "Solicitação inválida",
        fr: "Mauvaise requête",
        it: "Richiesta non valida"
    },
    [ERROR_CODES.ERROR_MALFORMED_BAD_REQUEST]: {
        en: "Malformed request body. Please check the JSON syntax",
        es: "Cuerpo de la solicitud malformado. Por favor verifica la sintaxis JSON",
        pt: "Corpo da solicitação malformado. Verifique a sintaxe JSON",
        fr: "Corps de requête mal formé. Veuillez vérifier la syntaxe JSON",
        it: "Corpo della richiesta malformato. Controlla la sintassi JSON"
    },
    [ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR]: {
        en: "An unexpected error occurred. Please try again later",
        es: "Ocurrió un error inesperado. Por favor intenta de nuevo más tarde",
        pt: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde",
        fr: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard",
        it: "Si è verificato un errore imprevisto. Per favore riprova più tardi"
    },
    [ERROR_CODES.CODE_PHOTOS_ONLY]: {
        en: "The file is not supported. Please upload a photo",
        es: "El archivo no es compatible. Por favor sube una foto",
        pt: "O arquivo não é suportado. Por favor, envie uma foto",
        fr: "Le fichier n'est pas pris en charge. Veuillez télécharger une photo",
        it: "Il file non è supportato. Carica una foto"
    },
    [ERROR_CODES.CODE_USER_EXISTS]: {
        en: "A user with this email already exists",
        es: "Ya existe un usuario con este correo",
        pt: "Já existe um usuário com este email",
        fr: "Un utilisateur avec cet email existe déjà",
        it: "Un utente con questa email esiste già"
    },
    [ERROR_CODES.CODE_ERROR_LOGIN]: {
        en: "Email or password incorrect. Try again.",
        es: "Correo o contraseña incorrectos. Inténtalo de nuevo.",
        pt: "Email ou senha incorretos. Tente novamente.",
        fr: "E-mail ou mot de passe incorrect. Réessayez.",
        it: "Email o password non corretti. Riprova."
    },
    [ERROR_CODES.CODE_USER_NOT_FOUND]: {
        en: "User not found",
        es: "Usuario no encontrado",
        pt: "Usuário não encontrado",
        fr: "Utilisateur non trouvé",
        it: "Utente non trovato"
    },
    [ERROR_CODES.CODE_EXPIRED_VERIFICATION_CODE]: {
        en: "The verification code has expired. Please request a new one",
        es: "El código de verificación ha expirado. Por favor solicita uno nuevo",
        pt: "O código de verificação expirou. Por favor, solicite um novo",
        fr: "Le code de vérification a expiré. Veuillez en demander un nouveau",
        it: "Il codice di verifica è scaduto. Si prega di richiederne uno nuovo"
    },
    [ERROR_CODES.CODE_INVALID_VERIFICATION_CODE]: {
        en: "The verification code is invalid. Please try again",
        es: "El código de verificación es inválido. Por favor intenta de nuevo",
        pt: "O código de verificação é inválido. Por favor, tente novamente",
        fr: "Le code de vérification est invalide. Veuillez réessayer",
        it: "Il codice di verifica non è valido. Per favore riprova"
    },
    [ERROR_CODES.CODE_RESEND_VERIFICATION_CODE_TOO_MANY_REQUESTS]: {
        en: "A verification code was already sent. Try again later.",
        es: "Ya se ha enviado un código de verificación. Intenta de nuevo más tarde.",
        pt: "Um código de verificação já foi enviado. Tente novamente mais tarde.",
        fr: "Un code de vérification a déjà été envoyé. Réessayez plus tard.",
        it: "Un codice di verifica è già stato inviato. Riprova più tardi."
    },
    [ERROR_CODES.CODE_GROUP_NOT_ACTIVE]: {
        en: "This group is not available.",
        es: "Este grupo no está disponible.",
        pt: "Este grupo não está disponível.",
        fr: "Ce groupe n'est pas disponible.",
        it: "Questo gruppo non è disponibile."
    },
    [ERROR_CODES.CODE_GROUP_ALREADY_UNLOCKED]: {
        en: "You have already unlocked this group.",
        es: "Ya has desbloqueado este grupo.",
        pt: "Você já desbloqueou este grupo.",
        fr: "Vous avez déjà débloqué ce groupe.",
        it: "Hai già sbloccato questo gruppo."
    },
    [ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED]: {
        en: "Payment validation failed. Please verify your purchase and try again.",
        es: "La validación del pago falló. Verifica tu compra e inténtalo de nuevo.",
        pt: "A validação do pagamento falhou. Verifique sua compra e tente novamente.",
        fr: "La validation du paiement a échoué. Vérifiez votre achat et réessayez.",
        it: "La validazione del pagamento non è riuscita. Verifica il tuo acquisto e riprova."
    },
    [ERROR_CODES.FIELD_INVALID]: {
        en: "Invalid field: ",
        es: "Campo inválido: ",
        pt: "Campo inválido: ",
        fr: "Champ invalide : ",
        it: "Campo non valido: "
    },
    [ERROR_CODES.FIELD_MAX]: {
        en: "Field too long: ",
        es: "Campo demasiado largo: ",
        pt: "Campo muito longo: ",
        fr: "Champ trop long : ",
        it: "Campo troppo lungo: "
    },
    [ERROR_CODES.FIELD_MIN]: {
        en: "Field too short: ",
        es: "Campo demasiado corto: ",
        pt: "Campo muito curto: ",
        fr: "Champ trop court : ",
        it: "Campo troppo corto: "
    },
    [ERROR_CODES.FIELD_NUMBER_ONLY]: {
        en: "Only numbers allowed: ",
        es: "Solo se permiten números: ",
        pt: "Apenas números são permitidos: ",
        fr: "Seulement des chiffres autorisés : ",
        it: "Sono consentiti solo numeri: "
    },
    [ERROR_CODES.FIELD_PATTERN]: {
        en: "Field does not match required pattern: ",
        es: "El campo no cumple con el patrón requerido: ",
        pt: "O campo não corresponde ao padrão exigido: ",
        fr: "Le champ ne correspond pas au format requis : ",
        it: "Il campo non corrisponde al modello richiesto: "
    },
    [ERROR_CODES.FIELD_REQUIRED]: {
        en: "Field required: ",
        es: "Campo requerido: ",
        pt: "Campo obrigatório: ",
        fr: "Champ requis : ",
        it: "Campo richiesto: "
    },

    //EMAIL TEMPLATES
    [EMAIL_TEMPLATES.USER_REGISTRATION]: {
        en: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Welcome [name],</h2><p>Your verification code</p><h3 style='color: #2ECC71;'>[code]</h3><p>This code is valid for <strong>[verificationExpireMins] minutes</strong>. For your security, please do not share it with anyone.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>This is an automated message. If you did not request this code, please ignore it and do not reply.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>UnlockIT Adventure Team</p></div>",
        es: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Bienvenido [name],</h2><p>Tu código de verificación</p><h3 style='color: #2ECC71;'>[code]</h3><p>Este código es válido por <strong>[verificationExpireMins] minutos</strong>. Por tu seguridad, por favor no lo compartas con nadie.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Este es un mensaje automático. Si no solicitaste este código, por favor ignóralo y no respondas.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Equipo de UnlockIT Adventure</p></div>",
        pt: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Bem-vindo [name],</h2><p>Seu código de verificação</p><h3 style='color: #2ECC71;'>[code]</h3><p>Este código é válido por <strong>[verificationExpireMins] minutos</strong>. Por sua segurança, por favor, não o compartilhe com ninguém.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Esta é uma mensagem automática. Se você não solicitou este código, por favor ignore e não responda.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Equipe UnlockIT Adventure</p></div>",
        fr: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Bienvenue [name],</h2><p>Votre code de vérification</p><h3 style='color: #2ECC71;'>[code]</h3><p>Ce code est valide pendant <strong>[verificationExpireMins] minutes</strong>. Pour votre sécurité, veuillez ne le partager avec personne.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Ceci est un message automatique. Si vous n'avez pas demandé ce code, veuillez l'ignorer et ne pas répondre.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>L'équipe UnlockIT Adventure</p></div>",
        it: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Benvenuto [name],</h2><p>Il tuo codice di verifica</p><h3 style='color: #2ECC71;'>[code]</h3><p>Questo codice è valido per <strong>[verificationExpireMins] minuti</strong>. Per la tua sicurezza, ti preghiamo di non condividerlo con nessuno.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Questo è un messaggio automatico. Se non hai richiesto questo codice, ignoralo e non rispondere.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Team di UnlockIT Adventure</p></div>"
    },
    [EMAIL_TEMPLATES.VERIFICATION_CODE]: {
        en: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Hello [name],</h2><p>Your verification code</p><h3 style='color: #2ECC71;'>[code]</h3><p>This code is valid for <strong>[verificationExpireMins] minutes</strong>. For your security, please do not share it with anyone.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>This is an automated message. If you did not request this code, please ignore it and do not reply.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>UnlockIT Adventure Team</p></div>",
        es: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Hola [name],</h2><p>Tu código de verificación</p><h3 style='color: #2ECC71;'>[code]</h3><p>Este código es válido por <strong>[verificationExpireMins] minutos</strong>. Por tu seguridad, por favor no lo compartas con nadie.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Este es un mensaje automático. Si no solicitaste este código, por favor ignóralo y no respondas.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Equipo de UnlockIT Adventure</p></div>",
        pt: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Olá [name],</h2><p>Seu código de verificação</p><h3 style='color: #2ECC71;'>[code]</h3><p>Este código é válido por <strong>[verificationExpireMins] minutos</strong>. Por sua segurança, por favor, não o compartilhe com ninguém.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Esta é uma mensagem automática. Se você não solicitou este código, por favor ignore e não responda.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Equipe UnlockIT Adventure</p></div>",
        fr: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Bonjour [name],</h2><p>Votre code de vérification</p><h3 style='color: #2ECC71;'>[code]</h3><p>Ce code est valide pendant <strong>[verificationExpireMins] minutes</strong>. Pour votre sécurité, veuillez ne le partager avec personne.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Ceci est un message automatique. Si vous n'avez pas demandé ce code, veuillez l'ignorer et ne pas répondre.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>L'équipe UnlockIT Adventure</p></div>",
        it: "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'><h2 style='color: #2ECC71; margin-bottom: 10px;'>Ciao [name],</h2><p>Il tuo codice di verifica</p><h3 style='color: #2ECC71;'>[code]</h3><p>Questo codice è valido per <strong>[verificationExpireMins] minuti</strong>. Per la tua sicurezza, ti preghiamo di non condividerlo con nessuno.</p><p style='font-size: 12px; color: #888; margin-top: 30px;'>Questo è un messaggio automatico. Se non hai richiesto questo codice, ignoralo e non rispondere.</p><hr style='margin: 28px 0;'><p style='font-size: 12px; color: #888;'>Team di UnlockIT Adventure</p></div>"
    },

    //EMAIL SUBJECTS
    [EMAIL_SUBJECTS.VERIFICATION_CODE]: {
        en: "Your UnlockIT Adventure Code",
        es: "Tu código de UnlockIT Adventure",
        pt: "Seu código UnlockIT Adventure",
        fr: "Votre code UnlockIT Adventure",
        it: "Il tuo codice UnlockIT Adventure"
    },

    // SUCCESS
    [SUCCESS_CODES.CODE_REGISTER_SUCCESS]: {
        en: "Registration successful. We have sent you an email. Please also check your spam folder",
        es: "Registro exitoso. Te hemos enviado un correo electrónico. Por favor revisa también tu carpeta de spam",
        pt: "Registro realizado com sucesso. Enviamos um e-mail para você. Verifique também sua pasta de spam",
        fr: "Inscription réussie. Nous vous avons envoyé un e-mail. Veuillez également vérifier votre dossier spam",
        it: "Registrazione riuscita. Ti abbiamo inviato un'email. Controlla anche la cartella spam"
    },
    [SUCCESS_CODES.CODE_VERIFICATION_SUCCESS]: {
        en: "Verification successful",
        es: "Verificación exitosa",
        pt: "Verificação bem-sucedida",
        fr: "Vérification réussie",
        it: "Verifica riuscita"
    },
    [SUCCESS_CODES.CODE_RESET_PASSWORD_SUCCESS]: {
        en: "Your password has been successfully reset. You can now sign in with your new credentials.",
        es: "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tus nuevas credenciales.",
        pt: "Sua senha foi redefinida com sucesso. Agora você pode entrar com suas novas credenciais.",
        fr: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouvelles informations.",
        it: "La tua password è stata reimpostata con successo. Ora puoi accedere con le tue nuove credenziali."
    },
    [SUCCESS_CODES.CODE_SENT_SUCCESS]: {
        en: "Verification code sent successfully. We have sent you an email. Please also check your spam folder",
        es: "Código de verificación enviado con éxito. Te hemos enviado un correo electrónico. Por favor revisa también tu carpeta de spam",
        pt: "Código de verificação enviado com sucesso. Enviamos um e-mail para você. Verifique também sua pasta de spam",
        fr: "Code de vérification envoyé avec succès. Nous vous avons envoyé un e-mail. Veuillez également vérifier votre dossier spam",
        it: "Codice di verifica inviato con successo. Ti abbiamo inviato un'email. Controlla anche la cartella spam"
    },
    [SUCCESS_CODES.CODE_UNLOCK_GROUP_SUCCESS]: {
        en: "Group unlocked successfully.",
        es: "Grupo desbloqueado exitosamente.",
        pt: "Grupo desbloqueado com sucesso.",
        fr: "Groupe débloqué avec succès.",
        it: "Gruppo sbloccato con successo."
    }
};


module.exports = {
    FIELDS,
    EMAIL_TEMPLATES,
    EMAIL_SUBJECTS,
    ERROR_CODES,
    SUCCESS_CODES,
    TRANSLATIONS,
};
