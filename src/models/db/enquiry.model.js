module.exports = (sequelize,DataTypes) =>{
    const Enquiry = sequelize.define("enquiries",{
      enquiry_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name:{
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
      },
      email:{
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
      },
      gender: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue:"male"
      },
      phone:{
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
      },
      nationality:{
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue:""
      },
      address:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue:""
      },
      age:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      under_18_with_parents:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      socailmedia:{
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue:""
      },
      height:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      hair_color:{
        type: DataTypes.STRING(25),
        allowNull: false,
        defaultValue:0
      },
      weight:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      waist:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      hip:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      chest_or_bust:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      },
      theme:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue:""
      },
      theme_link:{
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue:""
      },
      

    },
    {freezeTableName: true,
     timestamps:true});

    return Enquiry;
}