const FIELDS = {
    EMAIL: "email",
    AUTH_TYPE: "authType",
    TOKEN_ID: "tokenId",
    GROUP_ID: "groupId",
    PURCHASE_TOKEN: "purchaseToken",
    PRODUCT_ID: "productId",
    GROUP_PROGRESS_ID: "groupProgressId",
    PARTNER_IDS: "partnerIds",
    PARTNER_ID: "partnerId",
    KEY_ACTIVITY: "keyActivity",
    NOTES: "notes",
};

const ERROR_CODES = {
    FIELD_INVALID: "FIELD_INVALID",
    FIELD_MAX: "FIELD_MAX",
    FIELD_MIN: "FIELD_MIN",
    FIELD_NUMBER_ONLY: "FIELD_NUMBER_ONLY",
    FIELD_PATTERN: "FIELD_PATTERN",
    FIELD_REQUIRED: "FIELD_REQUIRED",
    CODE_PHOTOS_ONLY: "CODE_PHOTOS_ONLY",
    CODE_ERROR_AUTH: "CODE_ERROR_AUTH",
    CODE_SOCIAL_AUTH_FAILED: "CODE_SOCIAL_AUTH_FAILED",
    CODE_SOCIAL_AUTH_EMAIL_REQUIRED: "CODE_SOCIAL_AUTH_EMAIL_REQUIRED",
    CODE_SOCIAL_AUTH_NOT_IMPLEMENTED: "CODE_SOCIAL_AUTH_NOT_IMPLEMENTED",
    CODE_USER_NOT_FOUND: "CODE_USER_NOT_FOUND",
    CODE_GROUP_NOT_ACTIVE: "CODE_GROUP_NOT_ACTIVE",
    CODE_GROUP_ALREADY_UNLOCKED: "CODE_GROUP_ALREADY_UNLOCKED",
    CODE_GOOGLE_PLAY_VALIDATION_FAILED: "CODE_GOOGLE_PLAY_VALIDATION_FAILED",
    CODE_GROUP_PROGRESS_NOT_FOUND: "CODE_GROUP_PROGRESS_NOT_FOUND",
    CODE_GROUP_PROGRESS_FORBIDDEN: "CODE_GROUP_PROGRESS_FORBIDDEN",
    CODE_PARTNER_EMAIL_NOT_FOUND: "CODE_PARTNER_EMAIL_NOT_FOUND",
    CODE_PARTNER_CANNOT_BE_SELF: "CODE_PARTNER_CANNOT_BE_SELF",
    CODE_PARTNER_NOT_FOUND: "CODE_PARTNER_NOT_FOUND",
    CODE_REMOVE_PARTNER_FORBIDDEN: "CODE_REMOVE_PARTNER_FORBIDDEN",
    CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN: "CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN",
    CODE_GROUP_PROGRESS_ACTIVITY_NOT_FOUND: "CODE_GROUP_PROGRESS_ACTIVITY_NOT_FOUND",
    CODE_GROUP_PROGRESS_UPDATE_NO_FIELDS: "CODE_GROUP_PROGRESS_UPDATE_NO_FIELDS",
    ERROR_BAD_REQUEST_RESPONSE: "ERROR_BAD_REQUEST_RESPONSE",
    ERROR_MALFORMED_BAD_REQUEST: "ERROR_MALFORMED_BAD_REQUEST",
    ERROR_INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};

const SUCCESS_CODES = {
    CODE_LOGIN_SUCCESS: "CODE_LOGIN_SUCCESS",
    CODE_UNLOCK_GROUP_SUCCESS: "CODE_UNLOCK_GROUP_SUCCESS",
    CODE_ADD_PARTNERS_SUCCESS: "CODE_ADD_PARTNERS_SUCCESS",
    CODE_REMOVE_PARTNER_SUCCESS: "CODE_REMOVE_PARTNER_SUCCESS",
    CODE_UPDATE_GROUP_PROGRESS_SUCCESS: "CODE_UPDATE_GROUP_PROGRESS_SUCCESS",
};

const TRANSLATIONS = {
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
    [FIELDS.GROUP_PROGRESS_ID]: {
        en: "group progress id",
        es: "id de progreso del grupo",
        pt: "id de progresso do grupo",
        fr: "id de progression du groupe",
        it: "id progresso gruppo"
    },
    [FIELDS.PARTNER_IDS]: {
        en: "emails",
        es: "correos",
        pt: "emails",
        fr: "emails",
        it: "email"
    },
    [FIELDS.PARTNER_ID]: {
        en: "partner id",
        es: "id de compañero",
        pt: "id do parceiro",
        fr: "id du partenaire",
        it: "id partner"
    },
    [FIELDS.KEY_ACTIVITY]: {
        en: "activity",
        es: "actividad",
        pt: "atividade",
        fr: "activité",
        it: "attività"
    },
    [FIELDS.NOTES]: {
        en: "notes",
        es: "notas",
        pt: "notas",
        fr: "notes",
        it: "note"
    },
    [FIELDS.EMAIL]: {
        en: "email",
        es: "correo",
        pt: "email",
        fr: "email",
        it: "email"
    },
    [FIELDS.AUTH_TYPE]: {
        en: "auth type",
        es: "tipo de autenticación",
        pt: "tipo de autenticação",
        fr: "type d'authentification",
        it: "tipo di autenticazione"
    },
    [FIELDS.TOKEN_ID]: {
        en: "token id",
        es: "token id",
        pt: "token id",
        fr: "token id",
        it: "token id"
    },

    // ERROR CODES
    [ERROR_CODES.CODE_ERROR_AUTH]: {
        en: "Session expired. Please log in again.",
        es: "Sesión expirada. Inicia sesión nuevamente.",
        pt: "Sessão expirada. Faça login novamente.",
        fr: "Session expirée. Veuillez vous reconnecter.",
        it: "Sessione scaduta. Accedi di nuovo."
    },
    [ERROR_CODES.CODE_SOCIAL_AUTH_FAILED]: {
        en: "Authentication failed. Please try again.",
        es: "La autenticación falló. Inténtalo de nuevo.",
        pt: "A autenticação falhou. Tente novamente.",
        fr: "L'authentification a échoué. Veuillez réessayer.",
        it: "Autenticazione non riuscita. Riprova."
    },
    [ERROR_CODES.CODE_SOCIAL_AUTH_EMAIL_REQUIRED]: {
        en: "Email is required on the first Apple sign-in.",
        es: "El correo es requerido en el primer inicio de sesión con Apple.",
        pt: "O email é obrigatório no primeiro login com Apple.",
        fr: "L'email est requis lors de la première connexion Apple.",
        it: "L'email è obbligatorio al primo accesso con Apple."
    },
    [ERROR_CODES.CODE_SOCIAL_AUTH_NOT_IMPLEMENTED]: {
        en: "This sign-in method is not available yet.",
        es: "Este método de inicio de sesión aún no está disponible.",
        pt: "Este método de login ainda não está disponível.",
        fr: "Cette méthode de connexion n'est pas encore disponible.",
        it: "Questo metodo di accesso non è ancora disponibile."
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
    [ERROR_CODES.CODE_USER_NOT_FOUND]: {
        en: "User not found",
        es: "Usuario no encontrado",
        pt: "Usuário não encontrado",
        fr: "Utilisateur non trouvé",
        it: "Utente non trovato"
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
    [ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND]: {
        en: "Group progress not found.",
        es: "Progreso del grupo no encontrado.",
        pt: "Progresso do grupo não encontrado.",
        fr: "Progression du groupe introuvable.",
        it: "Progresso del gruppo non trovato."
    },
    [ERROR_CODES.CODE_GROUP_PROGRESS_FORBIDDEN]: {
        en: "Only the group owner can add partners.",
        es: "Solo el dueño del grupo puede agregar compañeros.",
        pt: "Apenas o dono do grupo pode adicionar parceiros.",
        fr: "Seul le propriétaire du groupe peut ajouter des partenaires.",
        it: "Solo il proprietario del gruppo può aggiungere partner."
    },
    [ERROR_CODES.CODE_PARTNER_EMAIL_NOT_FOUND]: {
        en: "Some of the emails were not found.",
        es: "Alguno de los correos no fueron encontrados.",
        pt: "Alguns dos emails não foram encontrados.",
        fr: "Certains emails n'ont pas été trouvés.",
        it: "Alcune email non sono state trovate."
    },
    [ERROR_CODES.CODE_PARTNER_CANNOT_BE_SELF]: {
        en: "You cannot add yourself as a partner.",
        es: "No puedes agregarte a ti mismo como compañero.",
        pt: "Você não pode se adicionar como parceiro.",
        fr: "Vous ne pouvez pas vous ajouter comme partenaire.",
        it: "Non puoi aggiungere te stesso come partner."
    },
    [ERROR_CODES.CODE_PARTNER_NOT_FOUND]: {
        en: "Partner not found in this group progress.",
        es: "Compañero no encontrado en este progreso del grupo.",
        pt: "Parceiro não encontrado neste progresso do grupo.",
        fr: "Partenaire introuvable dans cette progression du groupe.",
        it: "Partner non trovato in questo progresso del gruppo."
    },
    [ERROR_CODES.CODE_REMOVE_PARTNER_FORBIDDEN]: {
        en: "You can only remove yourself from this group progress.",
        es: "Solo puedes eliminarte a ti mismo de este progreso del grupo.",
        pt: "Você só pode se remover deste progresso do grupo.",
        fr: "Vous ne pouvez vous retirer que vous-même de cette progression du groupe.",
        it: "Puoi rimuovere solo te stesso da questo progresso del gruppo."
    },
    [ERROR_CODES.CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN]: {
        en: "You must be the owner or a partner to update this group progress.",
        es: "Debes ser el dueño o un compañero para actualizar este progreso del grupo.",
        pt: "Você deve ser o dono ou um parceiro para atualizar este progresso do grupo.",
        fr: "Vous devez être le propriétaire ou un partenaire pour mettre à jour cette progression du groupe.",
        it: "Devi essere il proprietario o un partner per aggiornare questo progresso del gruppo."
    },
    [ERROR_CODES.CODE_GROUP_PROGRESS_ACTIVITY_NOT_FOUND]: {
        en: "Activity not found in this group progress.",
        es: "Actividad no encontrada en este progreso del grupo.",
        pt: "Atividade não encontrada neste progresso do grupo.",
        fr: "Activité introuvable dans cette progression du groupe.",
        it: "Attività non trovata in questo progresso del gruppo."
    },
    [ERROR_CODES.CODE_GROUP_PROGRESS_UPDATE_NO_FIELDS]: {
        en: "At least one of completed, activityCompletedAt, groupCompletedAt or notes is required.",
        es: "Al menos uno de completed, activityCompletedAt, groupCompletedAt o notes es requerido.",
        pt: "Pelo menos um de completed, activityCompletedAt, groupCompletedAt ou notes é obrigatório.",
        fr: "Au moins un des champs completed, activityCompletedAt, groupCompletedAt ou notes est requis.",
        it: "Almeno uno tra completed, activityCompletedAt, groupCompletedAt o notes è obbligatorio."
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

    // SUCCESS
    [SUCCESS_CODES.CODE_LOGIN_SUCCESS]: {
        en: "Login successful.",
        es: "Inicio de sesión exitoso.",
        pt: "Login realizado com sucesso.",
        fr: "Connexion réussie.",
        it: "Accesso riuscito."
    },
    [SUCCESS_CODES.CODE_UNLOCK_GROUP_SUCCESS]: {
        en: "Group unlocked successfully.",
        es: "Grupo desbloqueado exitosamente.",
        pt: "Grupo desbloqueado com sucesso.",
        fr: "Groupe débloqué avec succès.",
        it: "Gruppo sbloccato con successo."
    },
    [SUCCESS_CODES.CODE_ADD_PARTNERS_SUCCESS]: {
        en: "Emails added successfully.",
        es: "Correos agregados exitosamente.",
        pt: "Emails adicionados com sucesso.",
        fr: "Emails ajoutés avec succès.",
        it: "Email aggiunte con successo."
    },
    [SUCCESS_CODES.CODE_REMOVE_PARTNER_SUCCESS]: {
        en: "Partner removed successfully.",
        es: "Compañero eliminado exitosamente.",
        pt: "Parceiro removido com sucesso.",
        fr: "Partenaire supprimé avec succès.",
        it: "Partner rimosso con successo."
    },
    [SUCCESS_CODES.CODE_UPDATE_GROUP_PROGRESS_SUCCESS]: {
        en: "Group progress updated successfully.",
        es: "Progreso del grupo actualizado exitosamente.",
        pt: "Progresso do grupo atualizado com sucesso.",
        fr: "Progression du groupe mise à jour avec succès.",
        it: "Progresso del gruppo aggiornato con successo."
    }
};


module.exports = {
    FIELDS,
    ERROR_CODES,
    SUCCESS_CODES,
    TRANSLATIONS,
};
