const mongoose = require('mongoose')
const validator = require('validator')


const ModulesSchema = new mongoose.Schema({
   
    id_event : {
        type : String, 
        required:true
    },

    photos_videos : {
        availability_time : {
            type : Date
        }, 

        medias : {
            type : Map, 
            of : {
                content : { 
                    type:String
                },
                id_author : {
                    type : String, 
                    required:true
                },
                status: {
                    type: String,
                    enum: ['Pending', 'Active', 'Blacklisted', 'Finish'],
                    default: 'Pending'
                },
                date : { 
                    type : Date, 
                    default: Date.now 
                } 
            },
        },

        medias_display_time : {
            type : String
        },

        module_display_time : {
            type : String
        },

        videos : {
            type : Boolean, 
            default : false,
            required:true
        },

        loop : {
            type : Boolean, 
            default : false
        },
    }, 

    livre_d_or : {
        availability_time : {
            type : Date, 
        }, 

        messages : {
            type : Map, 
            of : {
                content : {
                    message : {
                        type : String
                    }, 
                    typographie : {
                        type : String
                    },
                    style : {
                        type : String 
                    },
                    couleurs : {
                        type : String 
                    },
                },

                id_author : {
                    type : String,
                    required:true
                },
                
                date : { 
                    type : Date, 
                    default: Date.now 
                }   
            }
        }, 

        is_private : {
            type : Boolean, 
            default : true
        }

    },
    
    fresque : {
        availability_time : {
            type : Date, 
        },

        module_display_time : {
            type : String
        },

        usable_graphic_elems : {
            type : Map,
            of : {
                name : {
                    type : String,
                    required : true
                }, 

                content : {
                    type:String
                }
            }
        },

        content : {
            type : Map,
            of : {
                drawings : {
                    type: String,
                    required:true
                }, 

                graphic_elems : {
                    type : Map,
                    of : {
                        id_graphic_elems : {
                            type : String,
                            required : true
                        }
                    }
                }
                
            }
        }

    },

    playlist : {
        availability_time : {
            type : Date, 
        }, 

        module_display_time : {
            type : String
        }, 

        authorized_users : {
            type : Boolean
        },
        
        songs : {
            type : Map,
            of : {
                    song_name : {
                        type : String,
                        required:true
                    },

                    song_author : {
                        type : String, 
                        required:true
                    },

                    submitter_id : {
                        type : String,
                        required:true
                    }
            }
        }

    }, 

    chat : {
        messages : {
            type : Map, 
            of : {
                content : {
                    type : String,
                    required:true
                }, 

                id_author : {
                    type : String,
                    required:true
                },
                date : { 
                    type : Date, 
                    default: Date.now 
                }
            }
        }, 
    }
})

const Modules = mongoose.model('Modules', ModulesSchema)

module.exports = Modules