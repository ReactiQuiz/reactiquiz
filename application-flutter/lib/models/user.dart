class User {
  final String id;
  final String username;
  final String email;
  final String? name;
  final String? address;
  final String? phone;
  final String? className;
  final bool isAdmin;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.name,
    this.address,
    this.phone,
    this.className,
    this.isAdmin = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Safely handle all fields with null checks
    final idValue = json['id'];
    final idValue2 = json['_id'];
    
    // Handle username - API returns 'name' but model expects 'username'
    final usernameValue = json['username'] ?? json['name'];
    final emailValue = json['email'];
    
    return User(
      id: idValue != null 
          ? idValue.toString() 
          : (idValue2 != null ? idValue2.toString() : ''),
      username: usernameValue != null ? usernameValue.toString() : '',
      email: emailValue != null ? emailValue.toString() : '',
      name: json['name']?.toString(),
      address: json['address']?.toString(),
      phone: json['phone']?.toString(),
      className: json['class']?.toString(),
      isAdmin: json['isAdmin'] == true || 
               json['isAdmin'] == 'true' ||
               json['isAdmin'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      if (name != null) 'name': name,
      if (address != null) 'address': address,
      if (phone != null) 'phone': phone,
      if (className != null) 'class': className,
      'isAdmin': isAdmin,
    };
  }
}
